document.addEventListener("alpine:init", () => {
    Alpine.data("foodOptimizer", () => ({
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

        addFood() {
            if (
                this.newFood.name &&
                this.newFood.calories &&
                this.newFood.sodium &&
                this.newFood.protein
            ) {
                this.foods.push({
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

        async init() {
            await this.loadUserID();
            this.loadData();
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

        saveEditedFood() {
            if (
                this.editForm.name &&
                this.editForm.calories &&
                this.editForm.sodium &&
                this.editForm.protein
            ) {
                this.foods[this.editingFoodIndex] = {
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
                        this.foods = foods;
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
    }));
});
