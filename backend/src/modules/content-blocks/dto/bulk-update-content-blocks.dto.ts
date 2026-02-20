import { IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class BlockUpdate {
  @IsString() id: string;
  @IsString() value: string;
}

export class BulkUpdateContentBlocksDto {
  @ApiProperty({ type: [BlockUpdate] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlockUpdate)
  blocks: BlockUpdate[];
}
