import { IsString, IsUrl, IsOptional, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'My React App' })
  @IsString() @MinLength(2) @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'https://myapp.vercel.app' })
  @IsUrl({ require_tld: false })
  siteUrl: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  description?: string;
}
