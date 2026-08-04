import { createContext, useCallback, useEffect, useState } from "react";
import { food_list as localFoodList, menu_list } from "../assets/assets";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
    const [food_list, setFoodList] = useState(localFoodList);
    const [cartItems, setCartItems] = useState({});
    const [token, setToken] = useState("");

    const addToCart = async (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
        if (!token) return;

        try {
            const response = await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
            if (!response.data.success) throw new Error(response.data.message);
        } catch (error) {
            setCartItems((prev) => ({ ...prev, [itemId]: Math.max((prev[itemId] || 1) - 1, 0) }));
            console.error("Unable to add item to cart", error);
        }
    };

    const removeFromCart = async (itemId) => {
        if (!cartItems[itemId]) return;
        setCartItems((prev) => ({ ...prev, [itemId]: Math.max(prev[itemId] - 1, 0) }));
        if (!token) return;

        try {
            const response = await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
            if (!response.data.success) throw new Error(response.data.message);
        } catch (error) {
            setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
            console.error("Unable to remove item from cart", error);
        }
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                const itemInfo = food_list.find((product) => product._id === item);
                if (itemInfo) totalAmount += itemInfo.price * cartItems[item];
            }
        }
        return totalAmount;
    };

    const fetchFoodList = useCallback(async () => {
        try {
            const response = await axios.get(url + "/api/food/list");
            if (response.data.success && response.data.data?.length) {
                setFoodList(response.data.data);
            }
        } catch (error) {
            console.error("Using local fallback food list:", error.message);
        }
    }, [url]);

    const loadCartData = useCallback(async (authTokenArg) => {
        const rawToken = typeof authTokenArg === "string" ? authTokenArg : (authTokenArg?.token || token);
        if (!rawToken) return;
        const response = await axios.post(url + "/api/cart/get", {}, { headers: { token: rawToken } });
        if (!response.data.success) throw new Error(response.data.message);
        setCartItems(response.data.cartData || {});
    }, [url, token]);

    useEffect(() => {
        async function loadData() {
            await fetchFoodList();
            const savedToken = localStorage.getItem("token");
            if (savedToken) {
                setToken(savedToken);
                try {
                    await loadCartData(savedToken);
                } catch (err) {
                    console.error("Failed to load user cart, token may be invalid:", err);
                    localStorage.removeItem("token");
                    setToken("");
                }
            }
        }
        loadData().catch((error) => console.error("Unable to load application data", error));
    }, [fetchFoodList, loadCartData]);

    const contextValue = {
        url,
        food_list,
        menu_list,
        cartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        token,
        setToken,
        loadCartData,
        setCartItems
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;