import { Measurement } from "./Measurement";

export const fetchData = async (): Promise<Measurement[]> => {
    try {
        const response = await fetch('http://127.0.0.1:5000/data');
        const json = (await response.json()) as Measurement[];
        return json;
    } catch (error) {
        console.error('Greška pri preuzimanju podataka:', error);
        return [];
    }
}