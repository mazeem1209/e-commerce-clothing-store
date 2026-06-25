package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"clothing-store/backend/internal/database"

	"github.com/gorilla/mux"
)

func RequestReturn(w http.ResponseWriter, r *http.Request) {
	var body struct {
		OrderID int    `json:"order_id"`
		UserID  int    `json:"user_id"`
		Reason  string `json:"reason"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	if body.OrderID == 0 || body.UserID == 0 || body.Reason == "" {
		http.Error(w, "All fields are required", http.StatusBadRequest)
		return
	}

	// Check if return already exists
	var existingID int
	err := database.DB.QueryRow(
		"SELECT id FROM returns WHERE order_id = ? AND user_id = ?",
		body.OrderID, body.UserID,
	).Scan(&existingID)

	if err == nil {
		http.Error(w, "Return already requested for this order", http.StatusBadRequest)
		return
	}

	// Create return request
	_, err = database.DB.Exec(
		"INSERT INTO returns (order_id, user_id, reason) VALUES (?, ?, ?)",
		body.OrderID, body.UserID, body.Reason,
	)
	if err != nil {
		http.Error(w, "Error creating return request", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Return request submitted successfully",
	})
}

func GetUserReturns(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userID, _ := strconv.Atoi(vars["user_id"])

	rows, err := database.DB.Query(
		"SELECT id, order_id, user_id, reason, status, created_at FROM returns WHERE user_id = ?",
		userID,
	)
	if err != nil {
		http.Error(w, "Error fetching returns", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var returns []map[string]interface{}
	for rows.Next() {
		var id, orderID, userIDVal int
		var reason, status string
		var createdAt []byte

		rows.Scan(&id, &orderID, &userIDVal, &reason, &status, &createdAt)

		returns = append(returns, map[string]interface{}{
			"id":         id,
			"order_id":   orderID,
			"user_id":    userIDVal,
			"reason":     reason,
			"status":     status,
			"created_at": string(createdAt),
		})
	}

	if returns == nil {
		returns = []map[string]interface{}{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(returns)
}

func GetAllReturns(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(
		"SELECT id, order_id, user_id, reason, status, created_at FROM returns ORDER BY created_at DESC",
	)
	if err != nil {
		http.Error(w, "Error fetching returns", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var returns []map[string]interface{}
	for rows.Next() {
		var id, orderID, userID int
		var reason, status string
		var createdAt []byte

		rows.Scan(&id, &orderID, &userID, &reason, &status, &createdAt)

		returns = append(returns, map[string]interface{}{
			"id":         id,
			"order_id":   orderID,
			"user_id":    userID,
			"reason":     reason,
			"status":     status,
			"created_at": string(createdAt),
		})
	}

	if returns == nil {
		returns = []map[string]interface{}{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(returns)
}

func UpdateReturnStatus(w http.ResponseWriter, r *http.Request) {
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
		"UPDATE returns SET status = ? WHERE id = ?",
		status, id,
	)
	if err != nil {
		http.Error(w, "Error updating return status", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Return status updated successfully",
	})
}