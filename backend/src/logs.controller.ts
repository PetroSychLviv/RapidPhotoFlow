import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
} from "@nestjs/common";
import {
  appendWorkflowLog,
  clearWorkflowLogs,
  getAllWorkflowLogs,
} from "./data/logStore";

@Controller("api/logs")
export class LogsController {
  @Get()
  async list(): Promise<string[]> {
    return getAllWorkflowLogs();
  }

  @Post()
  async create(@Body("line") line: string): Promise<string[]> {
    if (!line || typeof line !== "string") {
      throw new BadRequestException("Field 'line' (string) is required");
    }
    return appendWorkflowLog(line);
  }

  @Delete()
  async clear(): Promise<void> {
    await clearWorkflowLogs();
  }
}


