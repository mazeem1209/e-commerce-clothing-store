package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"clothing-store/backend/internal/database"

	"github.com/gorilla/mux"
)

func GetAllOrders(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(
		"SELECT id, user_id, total_amount, status, created_at FROM orders ORDER BY created_at DESC",
	)
	if err != nil {
		http.Error(w, "Error fetching orders", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var orders []map[string]interface{}
	for rows.Next() {
		var id, userID int
		var totalAmount float64
		var status string
		var createdAt []byte

		rows.Scan(&id, &userID, &totalAmount, &status, &createdAt)

		orders = append(orders, map[string]interface{}{
			"id":           id,
			"user_id":      userID,
			"total_amount": totalAmount,
			"status":       status,
			"created_at":   string(createdAt),
		})
	}

	if orders == nil {
		orders = []map[string]interface{}{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orders)
}

func UpdateOrderStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	var body map[string]string
	json.NewDecoder(r.Body).Decode(&body)

	status := body["status"]
	if status == "" {
		http.Error(w, "Status is required", http.StatusBadRequest)
		return
	}

	_, err := database.DB.Exec(
		"UPDATE orders SET status = ? WHERE id = ?",
		status, id,
	)
	if err != nil {
		http.Error(w, "Error updating order", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Order status updated successfully",
	})
}

func GetAllUsers(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(
		"SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC",
	)
	if err != nil {
		http.Error(w, "Error fetching users", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var users []map[string]interface{}
	for rows.Next() {
		var id int
		var name, email, role string
		var createdAt []byte

		rows.Scan(&id, &name, &email, &role, &createdAt)

		users = append(users, map[string]interface{}{
			"id":         id,
			"name":       name,
			"email":      email,
			"role":       role,
			"created_at": string(createdAt),
		})
	}

	if users == nil {
		users = []map[string]interface{}{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}