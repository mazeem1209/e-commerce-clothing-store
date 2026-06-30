package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"clothing-store/backend/internal/database"
	"clothing-store/backend/internal/models"

	"github.com/gorilla/mux"
)

func GetOrders(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, _ := strconv.Atoi(vars["user_id"])

	rows, err := database.DB.Query(
		"SELECT id, user_id, total_amount, status, created_at FROM orders WHERE user_id = ?",
		userID,
	)
	if err != nil {
		http.Error(w, "Error fetching orders", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		var o models.Order
		rows.Scan(&o.ID, &o.UserID, &o.TotalAmount, &o.Status, &o.CreatedAt)
		orders = append(orders, o)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orders)
}

func GetOrder(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	var o models.Order
	err := database.DB.QueryRow(
		"SELECT id, user_id, total_amount, status, created_at FROM orders WHERE id = ?", id,
	).Scan(&o.ID, &o.UserID, &o.TotalAmount, &o.Status, &o.CreatedAt)
	if err != nil {
		http.Error(w, "Order not found", http.StatusNotFound)
		return
	}

	// Get order items
	rows, err := database.DB.Query(
		"SELECT id, order_id, product_id, quantity, price FROM order_items WHERE order_id = ?", id,
	)
	if err != nil {
		http.Error(w, "Error fetching order items", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var item models.OrderItem
		rows.Scan(&item.ID, &item.OrderID, &item.ProductID, &item.Quantity, &item.Price)
		o.Items = append(o.Items, item)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(o)
}

func Checkout(w http.ResponseWriter, r *http.Request) {
	var req models.CheckoutRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if len(req.Items) == 0 {
		http.Error(w, "Cart is empty", http.StatusBadRequest)
		return
	}

	tx, err := database.DB.Begin()
	if err != nil {
		http.Error(w, "Error starting transaction", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback() // no-op if tx.Commit() succeeds

	var totalAmount float64

	// First pass: lock rows, verify stock, compute total
	for _, item := range req.Items {
		var stock int
		var name string
		err := tx.QueryRow(
			"SELECT name, stock FROM products WHERE id = ? FOR UPDATE",
			item.ProductID,
		).Scan(&name, &stock)
		if err != nil {
			http.Error(w, "Product not found", http.StatusBadRequest)
			return
		}

		if stock < item.Quantity {
			http.Error(w, "Product '"+name+"' is out of stock or has insufficient quantity", http.StatusConflict)
			return
		}

		totalAmount += item.Price * float64(item.Quantity)
	}

	// Create order
	result, err := tx.Exec(
		`INSERT INTO orders 
			(user_id, total_amount, first_name, last_name, email, phone, address, city, zip_code, country) 
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		req.UserID, totalAmount, req.FirstName, req.LastName, req.Email,
		req.Phone, req.Address, req.City, req.ZipCode, req.Country,
	)
	if err != nil {
		http.Error(w, "Error creating order", http.StatusInternalServerError)
		return
	}

	orderID, _ := result.LastInsertId()

	// Second pass: create order items + decrement stock
	for _, item := range req.Items {
		_, err = tx.Exec(
			"INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
			orderID, item.ProductID, item.Quantity, item.Price,
		)
		if err != nil {
			http.Error(w, "Error creating order item", http.StatusInternalServerError)
			return
		}

		_, err = tx.Exec(
			"UPDATE products SET stock = stock - ? WHERE id = ?",
			item.Quantity, item.ProductID,
		)
		if err != nil {
			http.Error(w, "Error updating stock", http.StatusInternalServerError)
			return
		}
	}

	// Clear cart in DB only if a logged-in user placed the order
	if req.UserID != nil {
		_, err = tx.Exec("DELETE FROM cart WHERE user_id = ?", *req.UserID)
		if err != nil {
			http.Error(w, "Error clearing cart", http.StatusInternalServerError)
			return
		}
	}

	if err := tx.Commit(); err != nil {
		http.Error(w, "Error finalizing order", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":  "Order placed successfully",
		"order_id": orderID,
		"total":    totalAmount,
	})
}