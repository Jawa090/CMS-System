import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateContentBlockDto {
  @ApiProperty({ example: 'New heading text here' })
  @IsString()
  value: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  editedById?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}
