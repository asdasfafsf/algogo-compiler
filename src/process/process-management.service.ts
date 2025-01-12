import { ProcessUsageDto } from './dto/ProcessUsageDto';
import { Injectable } from '@nestjs/common';
import * as pidusage from 'pidusage';

@Injectable()
export class ProcessManagementService {
  constructor() {}
  async getProcessUsage(pid: number): Promise<ProcessUsageDto> {
    try {
      const stats = await new Promise<pidusage.Status>((resolve, reject) => {
        pidusage(pid, (error, stats) => {
          if (error) {
            reject(error);
          }

          resolve(stats);
        });
      });
      const { cpu, memory, ppid, timestamp } = stats;
      return {
        memory,
        cpu,
        ppid,
        pid,
        processTime: timestamp,
      };
    } catch (err) {
      throw new Error('프로세스 실행 중 오류');
    }
  }
}
