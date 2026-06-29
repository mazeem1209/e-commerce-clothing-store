package handlers

import (
	"encoding/json"
	"net/http"

	"clothing-store/backend/internal/database"

	"github.com/gorilla/mux"
)

func CancelOrder(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	orderID := vars["id"]

	if orderID == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "Missing order ID"})
		return
	}

	query := "UPDATE orders SET status = ? WHERE id = ?"
	_, err := database.DB.Exec(query, "cancelled", orderID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Failed to cancel order in database"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Order successfully cancelled"})
}