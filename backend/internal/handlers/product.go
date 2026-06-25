package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"clothing-store/backend/internal/database"
	"clothing-store/backend/internal/models"

	"github.com/gorilla/mux"
)

func GetProducts(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query("SELECT id, name, description, price, stock, category, image_url FROM products")
	if err != nil {
		http.Error(w, "Error fetching products", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		rows.Scan(&p.ID, &p.Name, &p.Description, &p.Price, &p.Stock, &p.Category, &p.ImageURL)
		products = append(products, p)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(products)
}

func GetProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	var p models.Product
	err := database.DB.QueryRow(
		"SELECT id, name, description, price, stock, category, image_url FROM products WHERE id = ?", id,
	).Scan(&p.ID, &p.Name, &p.Description, &p.Price, &p.Stock, &p.Category, &p.ImageURL)
	if err != nil {
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

func CreateProduct(w http.ResponseWriter, r *http.Request) {
	var req models.ProductRequest
	json.NewDecoder(r.Body).Decode(&req)

	result, err := database.DB.Exec(
		"INSERT INTO products (name, description, price, stock, category, image_url) VALUES (?, ?, ?, ?, ?, ?)",
		req.Name, req.Description, req.Price, req.Stock, req.Category, req.ImageURL,
	)
	if err != nil {
		http.Error(w, "Error creating product", http.StatusInternalServerError)
		return
	}

	id, _ := result.LastInsertId()
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Product created successfully",
		"id":      id,
	})
}

func UpdateProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	var req models.ProductRequest
	json.NewDecoder(r.Body).Decode(&req)

	_, err := database.DB.Exec(
		"UPDATE products SET name=?, description=?, price=?, stock=?, category=?, image_url=? WHERE id=?",
		req.Name, req.Description, req.Price, req.Stock, req.Category, req.ImageURL, id,
	)
	if err != nil {
		http.Error(w, "Error updating product", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Product updated successfully",
	})
}

func DeleteProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars["id"])

	_, err := database.DB.Exec("DELETE FROM products WHERE id = ?", id)
	if err != nil {
		http.Error(w, "Error deleting product", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Product deleted successfully",
	})
}