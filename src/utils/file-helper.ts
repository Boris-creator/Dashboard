import * as XLSX from "xlsx";
export default class {
  exportXlsm<T extends Object>(
    fileData: T[],
    columnTitles: { [key: string]: string }
  ) {
    const heading = [Object.keys(fileData[0]).map((key) => columnTitles[key])];
    const rows = fileData.map((row) => [...Object.values(row)]);
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.sheet_add_aoa(worksheet, heading);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Лист1");
    const output = XLSX.write(workbook, {
      type: "binary",
      bookType: "xlsm",
    });
    const blob = new Blob([this.stringToArrayBuffer(output)], {
      type: "application/octet-stream",
    });
    return URL.createObjectURL(blob);
  }
  private stringToArrayBuffer(string: string) {
    const buffer = new ArrayBuffer(string.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < string.length; i++) {
      view[i] = string.charCodeAt(i) & 0xff;
    }
    return buffer;
  }
}
