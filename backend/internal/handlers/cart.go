package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"clothing-store/backend/internal/database"
	"clothing-store/backend/internal/middleware"
	"clothing-store/backend/internal/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
)

func GetCart(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, _ := strconv.Atoi(vars["user_id"])

	rows, err := database.DB.Query(`
		SELECT c.id, c.user_id, c.product_id, c.quantity,
		p.id, p.name, p.description, p.price, p.stock, p.category, p.image_url
		FROM cart c
		JOIN products p ON c.product_id = p.id
		WHERE c.user_id = ?`, userID)
	if err != nil {
		http.Error(w, "Error fetching cart", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var cartItems []models.CartItem
	for rows.Next() {
		var item models.CartItem
		rows.Scan(
			&item.ID, &item.UserID, &item.ProductID, &item.Quantity,
			&item.Product.ID, &item.Product.Name, &item.Product.Description,
			&item.Product.Price, &item.Product.Stock, &item.Product.Category,
			&item.Product.ImageURL,
		)
		cartItems = append(cartItems, item)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cartItems)
}

func AddToCart(w http.ResponseWriter, r *http.Request) {
	var item models.CartItem
	json.NewDecoder(r.Body).Decode(&item)

	// Check if item already exists in cart
	var existingID int
	err := database.DB.QueryRow(
		"SELECT id FROM cart WHERE user_id = ? AND product_id = ?",
		item.UserID, item.ProductID,
	).Scan(&existingID)

	if err == nil {
		// Item exists — update quantity
		_, err = database.DB.Exec(
			"UPDATE cart SET quantity = quantity + ? WHERE id = ?",
			item.Quantity, existingID,
		)
	} else {
		// Item doesn't exist — insert new
		_, err = database.DB.Exec(
			"INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
			item.UserID, item.ProductID, item.Quantity,
		)
	}

	if err != nil {
		http.Error(w, "Error updating cart", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Cart updated successfully",
	})
}

func RemoveFromCart(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	_, err := database.DB.Exec("DELETE FROM cart WHERE id = ?", id)
	if err != nil {
		http.Error(w, "Error removing from cart", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Item removed from cart",
	})
}

func UpdateCartQuantity(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	var body struct {
		Quantity int `json:"quantity"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	claims, ok := r.Context().Value(middleware.UserKey).(jwt.MapClaims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	userIDFloat, _ := claims["user_id"].(float64)
	userID := int(userIDFloat)

	_, err := database.DB.Exec(
		"UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?",
		body.Quantity, id, userID,
	)
	if err != nil {
		http.Error(w, "Error updating quantity", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Quantity updated",
	})
}