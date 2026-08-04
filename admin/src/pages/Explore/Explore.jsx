import React, { useEffect, useState } from 'react';
import './Explore.css';
import { url } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const categories = [
    "All",
    "Salad",
    "Rolls",
    "Deserts",
    "Sandwich",
    "Cake",
    "Pure Veg",
    "Pasta",
    "Noodles"
];

const Explore = () => {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("default");
    const [selectedItem, setSelectedItem] = useState(null);

    const fetchList = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${url}/api/food/list`);
            if (response.data.success) {
                setList(response.data.data);
            } else {
                toast.error("Failed to load food list");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to fetch items");
        } finally {
            setLoading(false);
        }
    };

    const removeFood = async (foodId, foodName) => {
        if (!window.confirm(`Are you sure you want to delete "${foodName}"?`)) return;
        try {
            const response = await axios.post(`${url}/api/food/remove`, { id: foodId });
            if (response.data.success) {
                toast.success(response.data.message || "Item removed successfully");
                if (selectedItem?._id === foodId) setSelectedItem(null);
                await fetchList();
            } else {
                toast.error(response.data.message || "Failed to remove item");
            }
        } catch (error) {
            toast.error("Error removing item");
        }
    };

    useEffect(() => {
        fetchList();
    }, []);

    // Filter and Sort Logic
    const filteredList = list.filter((item) => {
        const matchesCategory = selectedCategory === "All" || item.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    }).sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        if (sortBy === "category") return a.category.localeCompare(b.category);
        return 0;
    });

    // Calculated Statistics
    const totalItems = list.length;
    const avgPrice = totalItems > 0 ? (list.reduce((sum, item) => sum + Number(item.price), 0) / totalItems).toFixed(2) : "0.00";
    const totalCategories = new Set(list.map((i) => i.category)).size;

    return (
        <div className="explore-container">
            <div className="explore-header">
                <div>
                    <h2>Explore Items</h2>
                    <p className="explore-subtitle">Browse, filter, and inspect menu items across all categories.</p>
                </div>
                <button className="explore-refresh-btn" onClick={fetchList} disabled={loading}>
                    {loading ? "Refreshing..." : "↻ Refresh List"}
                </button>
            </div>

            {/* Dashboard Stats Bar */}
            <div className="explore-stats">
                <div className="stat-card">
                    <span className="stat-icon">📦</span>
                    <div>
                        <h3>{totalItems}</h3>
                        <p>Total Items</p>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">🏷️</span>
                    <div>
                        <h3>{totalCategories}</h3>
                        <p>Active Categories</p>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">💵</span>
                    <div>
                        <h3>${avgPrice}</h3>
                        <p>Average Price</p>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">🎯</span>
                    <div>
                        <h3>{filteredList.length}</h3>
                        <p>Showing Items</p>
                    </div>
                </div>
            </div>

            {/* Category Pills Filter */}
            <div className="category-pills">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        className={`pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat}
                        {cat === "All" ? ` (${totalItems})` : ` (${list.filter(i => i.category === cat).length})`}
                    </button>
                ))}
            </div>

            {/* Search and Sort Toolbar */}
            <div className="explore-toolbar">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search food item name or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="clear-search" onClick={() => setSearchQuery("")}>✕</button>
                    )}
                </div>

                <div className="sort-box">
                    <label htmlFor="sort-select">Sort by:</label>
                    <select
                        id="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="default">Default</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="category">Category</option>
                    </select>
                </div>
            </div>

            {/* Items Grid */}
            {loading ? (
                <div className="explore-loading">
                    <div className="spinner"></div>
                    <p>Loading explore items...</p>
                </div>
            ) : filteredList.length === 0 ? (
                <div className="explore-empty">
                    <p className="empty-title">No items found</p>
                    <p className="empty-sub">Try selecting a different category or clearing search query.</p>
                    <button onClick={() => { setSelectedCategory("All"); setSearchQuery(""); setSortBy("default"); }}>
                        Reset Filters
                    </button>
                </div>
            ) : (
                <div className="explore-grid">
                    {filteredList.map((item) => {
                        const imgUrl = item.image?.startsWith('http') || item.image?.startsWith('/')
                            ? item.image
                            : `${url}/images/${item.image}`;
                        return (
                            <div key={item._id} className="explore-card">
                                <div className="card-image-wrapper">
                                    <img src={imgUrl} alt={item.name} onError={(e) => { e.target.src = "https://via.placeholder.com/200?text=Food+Item"; }} />
                                    <span className="category-badge">{item.category}</span>
                                </div>
                                <div className="card-body">
                                    <div className="card-header">
                                        <h3 className="item-title">{item.name}</h3>
                                        <span className="item-price">${item.price}</span>
                                    </div>
                                    <p className="item-desc">{item.description}</p>
                                    <div className="card-actions">
                                        <button className="btn-detail" onClick={() => setSelectedItem(item)}>
                                            👁️ View Details
                                        </button>
                                        <button className="btn-delete" onClick={() => removeFood(item._id, item.name)}>
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Item Details Modal */}
            {selectedItem && (
                <div className="explore-modal-overlay" onClick={() => setSelectedItem(null)}>
                    <div className="explore-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{selectedItem.name}</h3>
                            <button className="close-modal" onClick={() => setSelectedItem(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <img
                                src={selectedItem.image?.startsWith('http') || selectedItem.image?.startsWith('/')
                                    ? selectedItem.image
                                    : `${url}/images/${selectedItem.image}`}
                                alt={selectedItem.name}
                                className="modal-img"
                            />
                            <div className="modal-info">
                                <p><strong>Category:</strong> <span className="category-badge">{selectedItem.category}</span></p>
                                <p><strong>Price:</strong> <span className="item-price">${selectedItem.price}</span></p>
                                <p><strong>Description:</strong></p>
                                <p className="modal-desc">{selectedItem.description}</p>
                                <p className="modal-id"><small>Item ID: {selectedItem._id}</small></p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-delete" onClick={() => removeFood(selectedItem._id, selectedItem.name)}>
                                Delete Item
                            </button>
                            <button className="btn-secondary" onClick={() => setSelectedItem(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Explore;
