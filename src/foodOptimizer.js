let initFinisher;

function foodOptimizer() {
    return {
        userID: "",
        constraints: {
            maxCalories: 2000,
            maxSodium: 2300,
            minProtein: 50,
        },
        foods: [],
        newFood: {
            name: "",
            calories: "",
            sodium: "",
            protein: "",
        },
        sortField: "proteinVsCalorie",
        sortOrder: "desc",
        saving: false,
        loading: false,
        lastSaved: null,
        editingFood: null,
        editingFoodIndex: null,
        editForm: {
            name: "",
            calories: "",
            sodium: "",
            protein: "",
        },
        showConstraintsModal: false,
        showAddFoodModal: false,
        showImportModal: false,
        showCreditsModal: false,
        importData: null,
        importPreview: null,
        creditsContent: "",

        addFood() {
            if (
                this.newFood.name &&
                this.newFood.calories &&
                this.newFood.sodium &&
                this.newFood.protein
            ) {
                this.foods.push({
                    id: crypto.randomUUID(),
                    name: this.newFood.name,
                    calories: parseFloat(this.newFood.calories),
                    sodium: parseFloat(this.newFood.sodium),
                    protein: parseFloat(this.newFood.protein),
                });
                this.newFood = {
                    name: "",
                    calories: "",
                    sodium: "",
                    protein: "",
                };
                this.saveFoods();
            }
        },

        initPromise: new Promise((resolve, reject) => {
            initFinisher = resolve;
        }),
        async init() {
            await this.loadUserID();
            await this.loadData();
            initFinisher();
        },

        removeFood(index) {
            this.foods.splice(index, 1);
            this.saveFoods();
        },

        openEditModal(food, index) {
            this.editingFoodIndex = index;
            this.editForm = {
                name: food.name,
                calories: food.calories,
                sodium: food.sodium,
                protein: food.protein,
            };
            this.editingFood = true;
        },

        closeEditModal() {
            this.editingFood = null;
            this.editingFoodIndex = null;
            this.editForm = {
                name: "",
                calories: "",
                sodium: "",
                protein: "",
            };
        },

        openConstraintsModal() {
            this.showConstraintsModal = true;
        },

        closeConstraintsModal() {
            this.showConstraintsModal = false;
        },

        openAddFoodModal() {
            this.showAddFoodModal = true;
        },

        closeAddFoodModal() {
            this.showAddFoodModal = false;
        },

        openImportModal() {
            this.showImportModal = true;
            // Close the dropdown menu
            const dropdown = document.querySelector('.dropdown');
            if (dropdown) {
                dropdown.removeAttribute('open');
            }
        },

        closeImportModal() {
            this.showImportModal = false;
            this.importData = null;
            this.importPreview = null;
        },

        async openCreditsModal() {
            // Close the dropdown menu
            const dropdown = document.querySelector('.dropdown');
            if (dropdown) {
                dropdown.removeAttribute('open');
            }

            // Fetch credits content if not already loaded
            if (!this.creditsContent) {
                try {
                    const response = await fetch('/credits.html');
                    if (response.ok) {
                        this.creditsContent = await response.text();
                    } else {
                        this.creditsContent = '<p>Unable to load credits.</p>';
                    }
                } catch (error) {
                    console.error('Failed to load credits:', error);
                    this.creditsContent = '<p>Error loading credits.</p>';
                }
            }

            this.showCreditsModal = true;
        },

        closeCreditsModal() {
            this.showCreditsModal = false;
        },

        saveEditedFood() {
            if (
                this.editForm.name &&
                this.editForm.calories &&
                this.editForm.sodium &&
                this.editForm.protein
            ) {
                this.foods[this.editingFoodIndex] = {
                    id:
                        this.foods[this.editingFoodIndex].id ||
                        crypto.randomUUID(),
                    name: this.editForm.name,
                    calories: parseFloat(this.editForm.calories),
                    sodium: parseFloat(this.editForm.sodium),
                    protein: parseFloat(this.editForm.protein),
                };
                this.saveFoods();
                this.closeEditModal();
            }
        },

        getProteinPercent(food) {
            return Math.round(
                (food.protein / this.constraints.minProtein) * 100
            );
        },

        getCaloriePercent(food) {
            return Math.round(
                (food.calories / this.constraints.maxCalories) * 100
            );
        },

        getSodiumPercent(food) {
            return Math.round((food.sodium / this.constraints.maxSodium) * 100);
        },

        getProteinVsCalorieRatio(food) {
            const proteinPercent = this.getProteinPercent(food);
            const caloriePercent = this.getCaloriePercent(food);
            const ratio =
                caloriePercent > 0 ? proteinPercent / caloriePercent : 0;
            return ratio.toFixed(2);
        },

        getProteinVsSodiumRatio(food) {
            const proteinPercent = this.getProteinPercent(food);
            const sodiumPercent = this.getSodiumPercent(food);
            const ratio =
                sodiumPercent > 0 ? proteinPercent / sodiumPercent : 0;
            return ratio.toFixed(2);
        },

        getProteinPercentClass(food) {
            const percent = this.getProteinPercent(food);
            if (percent >= 25) return "metric-good";
            if (percent >= 15) return "metric-warning";
            return "";
        },

        getCaloriePercentClass(food) {
            const percent = this.getCaloriePercent(food);
            if (percent <= 10) return "metric-good";
            if (percent <= 20) return "metric-warning";
            return "metric-poor";
        },

        getSodiumPercentClass(food) {
            const percent = this.getSodiumPercent(food);
            if (percent <= 5) return "metric-good";
            if (percent <= 15) return "metric-warning";
            return "metric-poor";
        },

        getProteinVsCalorieClass(food) {
            const ratio = parseFloat(this.getProteinVsCalorieRatio(food));
            if (ratio >= 2.0) return "metric-good";
            if (ratio >= 1.0) return "metric-warning";
            return "metric-poor";
        },

        getProteinVsSodiumClass(food) {
            const ratio = parseFloat(this.getProteinVsSodiumRatio(food));
            if (ratio >= 3.0) return "metric-good";
            if (ratio >= 1.0) return "metric-warning";
            return "metric-poor";
        },

        get sortedFoods() {
            return [...this.foods].sort((a, b) => {
                let aValue, bValue;

                switch (this.sortField) {
                    case "name":
                        aValue = a.name.toLowerCase();
                        bValue = b.name.toLowerCase();
                        break;
                    case "proteinPercent":
                        aValue = this.getProteinPercent(a);
                        bValue = this.getProteinPercent(b);
                        break;
                    case "caloriePercent":
                        aValue = this.getCaloriePercent(a);
                        bValue = this.getCaloriePercent(b);
                        break;
                    case "sodiumPercent":
                        aValue = this.getSodiumPercent(a);
                        bValue = this.getSodiumPercent(b);
                        break;
                    case "proteinVsCalorie":
                        aValue = parseFloat(this.getProteinVsCalorieRatio(a));
                        bValue = parseFloat(this.getProteinVsCalorieRatio(b));
                        break;
                    case "proteinVsSodium":
                        aValue = parseFloat(this.getProteinVsSodiumRatio(a));
                        bValue = parseFloat(this.getProteinVsSodiumRatio(b));
                        break;
                    default:
                        return 0;
                }

                if (typeof aValue === "string") {
                    return this.sortOrder === "asc"
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                }

                return this.sortOrder === "asc"
                    ? aValue - bValue
                    : bValue - aValue;
            });
        },

        sortBy(field) {
            if (this.sortField === field) {
                this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
            } else {
                this.sortField = field;
                this.sortOrder = field === "name" ? "asc" : "desc";
            }
        },

        async saveFoods() {
            if (!this.userID) return;
            this.saving = true;
            try {
                await fetch(`/data/${this.userID}/foods.json`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(this.foods),
                });
                this.lastSaved = new Date().toLocaleTimeString();
            } catch (error) {
                console.error("Failed to save foods:", error);
                alert("Failed to save foods. Please try again.");
            } finally {
                this.saving = false;
            }
        },

        async saveConstraints() {
            if (!this.userID) return;
            try {
                await fetch(`/data/${this.userID}/constraints.json`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(this.constraints),
                });
                this.lastSaved = new Date().toLocaleTimeString();
            } catch (error) {
                console.error("Failed to save constraints:", error);
                alert("Failed to save constraints. Please try again.");
            }
        },

        async loadUserID() {
            try {
                const response = await fetch("/.e/rest/session");
                if (response.ok) {
                    const session = await response.json();
                    if (session && session.data && session.data.user) {
                        this.userID = session.data.user;
                    }
                }
            } catch (error) {
                console.error("Failed to load user ID:", error);
            }
        },

        async loadData() {
            if (!this.userID) return;
            this.loading = true;
            try {
                const [foodsResponse, constraintsResponse] = await Promise.all([
                    fetch(`/data/${this.userID}/foods.json`).catch(() => ({
                        ok: false,
                    })),
                    fetch(`/data/${this.userID}/constraints.json`).catch(
                        () => ({ ok: false })
                    ),
                ]);

                if (foodsResponse.ok) {
                    const foods = await foodsResponse.json();
                    if (Array.isArray(foods)) {
                        // Ensure all foods have an id
                        this.foods = foods.map((food) => ({
                            ...food,
                            id: food.id || crypto.randomUUID(),
                        }));
                    }
                }

                if (constraintsResponse.ok) {
                    const constraints = await constraintsResponse.json();
                    if (constraints && typeof constraints === "object") {
                        this.constraints = {
                            ...this.constraints,
                            ...constraints,
                        };
                    }
                }

                if (foodsResponse.ok || constraintsResponse.ok) {
                    this.lastSaved = "Data loaded";
                }
            } catch (error) {
                console.error("Failed to load data:", error);
            } finally {
                this.loading = false;
            }
        },

        exportData(event) {
            // Stop event from propagating
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }

            // Close the dropdown menu
            const dropdown = document.querySelector('.dropdown');
            if (dropdown) {
                dropdown.removeAttribute('open');
            }

            // Create export object with foods and constraints
            const exportData = {
                foods: this.foods,
                constraints: this.constraints,
                exportedAt: new Date().toISOString(),
            };

            // Convert to JSON
            const jsonString = JSON.stringify(exportData, null, 2);

            // Create a blob and download link
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `foodminmax-export-${new Date().toISOString().split("T")[0]}.json`;

            // Don't add to DOM - just click directly
            link.click();

            // Cleanup after a short delay to ensure download starts
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 100);
        },

        processImportFile(file) {
            if (!file) {
                return;
            }

            // Validate file type
            if (!file.name.endsWith(".json")) {
                alert("Please select a JSON file.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);

                    // Validate the imported data structure
                    if (!importedData.foods || !Array.isArray(importedData.foods)) {
                        alert(
                            "Invalid import file format. The file must contain a 'foods' array."
                        );
                        return;
                    }

                    // Store the imported data for confirmation
                    this.importData = importedData;

                    // Create preview information
                    this.importPreview = {
                        foodsCount: importedData.foods.length,
                        exportedAt: importedData.exportedAt || null,
                        hasConstraints: !!importedData.constraints,
                        constraints: importedData.constraints || null,
                    };
                } catch (error) {
                    alert(
                        "Error reading import file. Please ensure it is a valid JSON file."
                    );
                    console.error("Import error:", error);
                }
            };

            reader.readAsText(file);
        },

        handleImportFileSelect(event) {
            const file = event.target.files[0];
            this.processImportFile(file);
        },

        async confirmImport() {
            if (!this.importData) {
                return;
            }

            const hasConstraints = this.importData.constraints;
            const confirmMessage = hasConstraints
                ? "Are you sure you want to import this data? This will replace all your current foods and constraints. This action cannot be undone."
                : "Are you sure you want to import this data? This will replace all your current foods. This action cannot be undone.";

            if (!confirm(confirmMessage)) {
                return;
            }

            // Ensure all foods have an id
            const foods = this.importData.foods.map((food) => ({
                ...food,
                id: food.id || crypto.randomUUID(),
            }));

            // Replace current data with imported data
            this.foods = foods;

            // Import constraints if they exist
            if (hasConstraints) {
                this.constraints = {
                    ...this.constraints,
                    ...this.importData.constraints,
                };
            }

            // Save the imported data
            await this.saveFoods();
            if (hasConstraints) {
                await this.saveConstraints();
            }

            // Clear import state and close modal
            this.closeImportModal();

            const message = hasConstraints
                ? `Successfully imported ${foods.length} foods and constraints.`
                : `Successfully imported ${foods.length} foods.`;
            alert(message);
        },

        cancelImport() {
            this.closeImportModal();
        },
    };
}

// Make foodOptimizer available globally for Alpine.js
window.foodOptimizer = foodOptimizer;

// Export for testing
export { foodOptimizer };
