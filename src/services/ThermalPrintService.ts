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
            "      Terima Kasih              \n\n\n";

        return header + body + footer;
    }

    /**
     * Placeholder for Bluetooth connection logic.
     * In a real React Native / Capacitor environment, this would interface with native plugins.
     */
    async print(data: ReceiptData) {
        const text = this.generateReceiptText(data);
        console.log("Printing to Thermal Printer:\n", text);

        // In actual implementation, we would use:
        // await BluetoothSerial.write(text);
        return true;
    }
}

export const thermalPrintService = new ThermalPrintService();
