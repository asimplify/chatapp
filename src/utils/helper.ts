export const getUserName = (token: string | null | undefined) => {
    if (!token) {
        return {
            first_name: null,
            last_name: null,
        };
    }
    try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        return {
            first_name: decodedToken.first_name || null,
            last_name: decodedToken.last_name || null,
        };
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
};