import $api from "../http";

class LectionService {

    static async createLection(lectionData) {
        const token = localStorage.getItem('token'); // Получаем токен из localStorage
        const config = {
            headers: {
                Authorization: `Bearer ${token}` // Добавляем токен в заголовки
            }
        };
        return $api.post('/createLections', lectionData, config);
    }

    static async deleteLection(lectionId) {
        return $api.delete(`/deleteLection/${lectionId}`); // Исправлено: параметр встроен в URL
    }

    static async updateLection(lectionId, updateData) {
        return $api.put(`/updateLections/${lectionId}`, updateData); // Исправлено: использование метода put и включение данных
    }

    static async getAllLections() {
        return $api.get('/getLections');
    }

    static async getLection(lectionId) {
        return $api.get(`/getLection/${lectionId}`); // Исправлено: параметр встроен в URL
    }
    
    static async addTestToLection(lectionId, testId) {
        return $api.post(`/addTestToLection/${lectionId}/${testId}`);
    }

}

export default LectionService;