import { makeAutoObservable, runInAction } from 'mobx';
import LectionService from '../services/lectureService';

class LectionStore {
    lections = [];
    isLoading = false;
    error = null;
    currentLection = null;

    constructor() {
        makeAutoObservable(this);
    }

    getAllLections = async () => {
        this.isLoading = true;
        this.error = null;
        try {
            const response = await LectionService.getAllLections();
            console.log("Ответ от API:", response);
            if (response && response.data) {
                runInAction(() => {
                    console.log("Данные лекций:", response.data);
                    this.lections = response.data; // Используем данные непосредственно из response.data
                });
                return response.data; // Возвращаем данные непосредственно
            } else {
                console.log("Ошибка: Некорректный ответ от сервера");
                return [];
            }
        } catch (error) {
            runInAction(() => {
                this.error = error.toString();
            });
            return [];
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    createLection = async (lectionData) => {
        try {
            const response = await LectionService.createLection(lectionData);
            runInAction(() => {
                this.lections.push(response.data);
            });
        } catch (error) {
            runInAction(() => {
                this.error = error.toString();
            });
        }
    }

    updateLection = async (lectionId, lectionData) => {
        try {
            const response = await LectionService.updateLection(lectionId, lectionData);
            runInAction(() => {
                const index = this.lections.findIndex(l => l._id === lectionId);
                if (index !== -1) {
                    this.lections[index] = response.data;
                }
            });
        } catch (error) {
            runInAction(() => {
                this.error = error.toString();  
            });
        }
    }

    deleteLection = async (lectionId) => {
        try {
            await LectionService.deleteLection(lectionId);
            runInAction(() => {
                this.lections = this.lections.filter(l => l._id !== lectionId);
            });
        } catch (error) {
            runInAction(() => {
                this.error = error.toString();
            });
        }
    }

    getLection = async (lectionId) => {
        try {
            console.log("Calling API to get lection by id:", lectionId);
            const response = await LectionService.getLection(lectionId);
            console.log("API response for getLectionById:", response.data);
            runInAction(() => { 
                this.currentLection = response.data;
                console.log("Current lection set to:", this.currentLection);
            });
        } catch (error) {
            runInAction(() => {
                this.error = error.toString();
                console.error("Error in getLectionById:", this.error);
            });
        }
    }

    async getStatistics(groupId) {
        try {
            const response = await LectionService.getStatistics(groupId);
            return response.data;
        } catch (error) {
            console.error('Ошибка при получении статистики:', error);
        }
    }
}

export default new LectionStore();
