import { PipeTransform, BadRequestException } from "@nestjs/common";
import { TaskStatus } from "../task-status.enum";

export class TaskStatusValidationPipe implements PipeTransform {
  readonly allowedStatuses = [
    TaskStatus.OPEN,
    TaskStatus.IN_PROGRESS,
    TaskStatus.DONE,
  ]

  transform(value: any) {
    value = value.toUpperCase()

    if (!Object.keys(TaskStatus).includes(value)) {
      throw new BadRequestException(`"${value} is a invalid status"`)
    }

    return value
  }
}