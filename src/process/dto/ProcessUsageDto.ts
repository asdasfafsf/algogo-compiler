export class ProcessUsageDto {
    memory: number;
    cpu?: number;
    ppid?: number;
    pid?: number;
    processTime: number;
}