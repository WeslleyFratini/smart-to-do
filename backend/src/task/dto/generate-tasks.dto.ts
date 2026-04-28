import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateTasksDto {
  @ApiProperty({ example: 'Learn TypeScript in 30 days' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  goal: string;
}
