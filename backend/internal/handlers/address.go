package handlers

import (
    "encoding/json"
    "net/http"
    "strconv"

    "clothing-store/backend/internal/database"
    "github.com/gorilla/mux"
)

func GetAddresses(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    userID, _ := strconv.Atoi(vars["user_id"])

    rows, err := database.DB.Query(
        "SELECT id, user_id, label, full_name, phone, address, city, zip_code, country, is_default FROM addresses WHERE user_id = ?",
        userID,
    )
    if err != nil {
        http.Error(w, "Error fetching addresses", http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    var addresses []map[string]interface{}
    for rows.Next() {
        var id, userIDVal int
        var label, fullName, phone, address, city, zipCode, country string
        var isDefault bool

        rows.Scan(&id, &userIDVal, &label, &fullName, &phone, &address, &city, &zipCode, &country, &isDefault)

        addresses = append(addresses, map[string]interface{}{
            "id":         id,
            "user_id":    userIDVal,
            "label":      label,
            "full_name":  fullName,
            "phone":      phone,
            "address":    address,
            "city":       city,
            "zip_code":   zipCode,
            "country":    country,
            "is_default": isDefault,
        })
    }

    if addresses == nil {
        addresses = []map[string]interface{}{}
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(addresses)
}

func AddAddress(w http.ResponseWriter, r *http.Request) {
    var body struct {
        UserID    int    `json:"user_id"`
        Label     string `json:"label"`
        FullName  string `json:"full_name"`
        Phone     string `json:"phone"`
        Address   string `json:"address"`
        City      string `json:"city"`
        ZipCode   string `json:"zip_code"`
        Country   string `json:"country"`
        IsDefault bool   `json:"is_default"`
    }
    json.NewDecoder(r.Body).Decode(&body)

    if body.UserID == 0 || body.Address == "" || body.City == "" {
        http.Error(w, "Required fields missing", http.StatusBadRequest)
        return
    }

    // If this is default, unset other defaults first
    if body.IsDefault {
        database.DB.Exec("UPDATE addresses SET is_default = FALSE WHERE user_id = ?", body.UserID)
    }

    result, err := database.DB.Exec(
        "INSERT INTO addresses (user_id, label, full_name, phone, address, city, zip_code, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        body.UserID, body.Label, body.FullName, body.Phone, body.Address, body.City, body.ZipCode, body.Country, body.IsDefault,
    )
    if err != nil {
        http.Error(w, "Error saving address", http.StatusInternalServerError)
        return
    }

    id, _ := result.LastInsertId()
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]interface{}{
        "message": "Address saved successfully",
        "id":      id,
    })
}

func UpdateAddress(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id, _ := strconv.Atoi(vars["id"])

    var body struct {
        UserID    int    `json:"user_id"`
        Label     string `json:"label"`
        FullName  string `json:"full_name"`
        Phone     string `json:"phone"`
        Address   string `json:"address"`
        City      string `json:"city"`
        ZipCode   string `json:"zip_code"`
        Country   string `json:"country"`
        IsDefault bool   `json:"is_default"`
    }
    json.NewDecoder(r.Body).Decode(&body)

    if body.IsDefault {
        database.DB.Exec("UPDATE addresses SET is_default = FALSE WHERE user_id = ?", body.UserID)
    }

    _, err := database.DB.Exec(
        "UPDATE addresses SET label=?, full_name=?, phone=?, address=?, city=?, zip_code=?, country=?, is_default=? WHERE id=?",
        body.Label, body.FullName, body.Phone, body.Address, body.City, body.ZipCode, body.Country, body.IsDefault, id,
    )
    if err != nil {
        http.Error(w, "Error updating address", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"message": "Address updated successfully"})
}

func DeleteAddress(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id, _ := strconv.Atoi(vars["id"])

    _, err := database.DB.Exec("DELETE FROM addresses WHERE id = ?", id)
    if err != nil {
        http.Error(w, "Error deleting address", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"message": "Address deleted successfully"})
}