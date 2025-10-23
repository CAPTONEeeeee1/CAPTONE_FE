// Giả định Base URL của bạn là http://localhost:3000 và các route nằm dưới /auth
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'; 
const AUTH_URL = `${BASE_URL}/auth`; 

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';


/**
 * Helper để xử lý các response từ API và ném lỗi nếu status >= 400.
 */
async function handleResponse(response) {
    if (response.ok) {
        // Trả về JSON nếu có nội dung, nếu không trả về success: true
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json();
        }
        return { success: true };
    }

    // Đảm bảo đọc body ngay cả khi lỗi để lấy thông tin chi tiết
    const errorData = await response.json().catch(() => ({ message: 'Unknown error', error: {} }));
    
    // Tạo đối tượng lỗi có chứa status và data để frontend xử lý
    const error = new Error(errorData.message || `API Error: ${response.status}`);
    error.status = response.status;
    error.response = { data: errorData };
    throw error;
}


const authService = {
    // --- Token Management ---

    saveTokens: (accessToken, refreshToken) => {
        if (accessToken) {
            localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        }
        if (refreshToken) {
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        }
    },

    getAccessToken: () => {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    },
    
    getRefreshToken: () => {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    clearTokens: () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },
    
    isAuthenticated: () => {
        return !!localStorage.getItem(ACCESS_TOKEN_KEY);
    },

    // --- API Calls ---

    /**
     * Gửi yêu cầu đăng ký người dùng mới (có thể trả về 202)
     */
    register: async (userData) => {
        const response = await fetch(`${AUTH_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        
        // Xử lý Response 202 (Accepted) khi cần xác minh email
        if (response.status === 202) {
             // Đảm bảo đọc JSON body để lấy userEmail
             const data = await response.json().catch(() => ({ userEmail: userData.email, message: "Verification required" }));
             return { success: true, message: "Verification required", userEmail: data.userEmail };
        }

        return handleResponse(response);
    },

    /**
     * Gửi yêu cầu xác minh OTP
     */
    verifyOtp: async (verificationData) => {
        const response = await fetch(`${AUTH_URL}/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(verificationData),
        });
        // SỬA LỖI: handleResponse sẽ ném lỗi nếu status là 40x hoặc 50x
        return handleResponse(response); 
    },

    /**
     * Gửi yêu cầu đăng nhập
     */
    login: async (credentials) => {
        const response = await fetch(`${AUTH_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        
        // Sử dụng lại handleResponse để xử lý lỗi và lấy data
        const data = await handleResponse(response);
        
        if (data.accessToken && data.refreshToken) {
            authService.saveTokens(data.accessToken, data.refreshToken);
        }
        return data;
    },

    me: async () => {
        const token = authService.getAccessToken();
        if (!token) throw new Error('No access token available');

        const response = await fetch(`${AUTH_URL}/me`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });
        return handleResponse(response);
    },

    logout: async () => {
        const refreshToken = authService.getRefreshToken();
        
        if (refreshToken) {
            await fetch(`${AUTH_URL}/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            }).catch(e => console.error("Logout API failed (ignoring):", e));
        }

        authService.clearTokens();
    }
};

export default authService;
