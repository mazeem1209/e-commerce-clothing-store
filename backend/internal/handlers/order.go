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
	json.NewDecoder(r.Body).Decode(&req)

	// Get cart items
	rows, err := database.DB.Query(`
		SELECT c.product_id, c.quantity, p.price
		FROM cart c
		JOIN products p ON c.product_id = p.id
		WHERE c.user_id = ?`, req.UserID)
	if err != nil {
		http.Error(w, "Error fetching cart", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var totalAmount float64
	type cartRow struct {
		ProductID int
		Quantity  int
		Price     float64
	}
	var cartRows []cartRow

	for rows.Next() {
		var cr cartRow
		rows.Scan(&cr.ProductID, &cr.Quantity, &cr.Price)
		totalAmount += cr.Price * float64(cr.Quantity)
		cartRows = append(cartRows, cr)
	}

	if len(cartRows) == 0 {
		http.Error(w, "Cart is empty", http.StatusBadRequest)
		return
	}

	// Create order
	result, err := database.DB.Exec(
		"INSERT INTO orders (user_id, total_amount) VALUES (?, ?)",
		req.UserID, totalAmount,
	)
	if err != nil {
		http.Error(w, "Error creating order", http.StatusInternalServerError)
		return
	}

	orderID, _ := result.LastInsertId()

	// Create order items
	for _, cr := range cartRows {
		database.DB.Exec(
			"INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
			orderID, cr.ProductID, cr.Quantity, cr.Price,
		)
	}

	// Clear cart
	database.DB.Exec("DELETE FROM cart WHERE user_id = ?", req.UserID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":  "Order placed successfully",
		"order_id": orderID,
		"total":    totalAmount,
	})
}