export interface ReceiptData {
    billNumber: string;
    name: string;
    objectName: string;
    amount: number;
    penalty: number;
    total: number;
    date: string;
    period: string;
}

class ThermalPrintService {
    private device: any = null;
    private characteristic: any = null;

    /**
     * Generates a text-based receipt compatible with most 58mm thermal printers.
     */
    generateReceiptText(data: ReceiptData): string {
        const separator = "--------------------------------\n";
        const header = "      BAPENDA KOTA BAUBAU      \n" +
            "      PENERIMAAN DAERAH        \n" +
            separator;

        const body = `BUKTI BAYAR : ${data.billNumber}\n` +
            `TANGGAL     : ${data.date}\n` +
            `NAMA        : ${data.name}\n` +
            `OBJEK       : ${data.objectName}\n` +
            `MASA/PERIODE: ${data.period}\n` +
            separator +
            `POKOK       : Rp ${data.amount.toLocaleString('id-ID')}\n` +
            `DENDA       : Rp ${data.penalty.toLocaleString('id-ID')}\n` +
            separator +
            `TOTAL       : Rp ${data.total.toLocaleString('id-ID')}\n` +
            separator;

        const footer = "  Simpan bukti ini sebagai      \n" +
            "  tanda terima resmi (SSPD).    \n" +
            "      Terima Kasih              \n\n\n\n";

        return header + body + footer;
    }

    /**
     * Connects to a Bluetooth Thermal Printer using Web Bluetooth API.
     */
    async connect() {
        if (!navigator.bluetooth) {
            throw new Error("Bluetooth tidak didukung di browser ini. Gunakan Chrome/Edge di Android.");
        }

        try {
            // Standard GATT service for many thermal printers
            const serviceId = 0xFF00; // Common for many ESC/POS printers, or 0x18F0

            this.device = await navigator.bluetooth.requestDevice({
                filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }],
                optionalServices: ['0000ff00-0000-1000-8000-00805f9b34fb']
            }).catch(() => {
                // Fallback for generic printers
                return navigator.bluetooth.requestDevice({
                    acceptAllDevices: true,
                    optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb', '0000ff00-0000-1000-8000-00805f9b34fb']
                });
            });

            if (!this.device || !this.device.gatt) return false;

            const server = await this.device.gatt.connect();
            const services = await server.getPrimaryServices();

            // Try to find a writable characteristic
            for (const service of services) {
                const characteristics = await service.getCharacteristics();
                for (const char of characteristics) {
                    if (char.properties.write || char.properties.writeWithoutResponse) {
                        this.characteristic = char;
                        break;
                    }
                }
                if (this.characteristic) break;
            }

            return !!this.characteristic;
        } catch (error) {
            console.error("Bluetooth connection failed:", error);
            throw error;
        }
    }

    /**
     * Sends receipt data to the connected printer.
     */
    async print(data: ReceiptData) {
        try {
            if (!this.characteristic) {
                const connected = await this.connect();
                if (!connected) throw new Error("Could not find a writable Bluetooth characteristic.");
            }

            const text = this.generateReceiptText(data);
            const encoder = new TextEncoder();
            const bytes = encoder.encode(text);

            // Send in chunks to avoid buffer overflow on small printers (standard 20 bytes for BLE)
            const chunkSize = 20;
            for (let i = 0; i < bytes.length; i += chunkSize) {
                const chunk = bytes.slice(i, i + chunkSize);
                await this.characteristic.writeValue(chunk);
            }

            return true;
        } catch (error) {
            console.error("Print failed:", error);
            this.characteristic = null; // Reset for retry
            throw error;
        }
    }
}

export const thermalPrintService = new ThermalPrintService();
