import { IsUrl, IsString, IsOptional, IsInt, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartCrawlDto {
  @ApiProperty({ example: 'https://my-react-app.vercel.app' })
  @IsUrl({ require_tld: false })  // allow localhost
  url: string;

  @ApiProperty({ example: 'project-uuid-here' })
  @IsString()
  projectId: string;

  @ApiProperty({ example: 5, default: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  maxDepth?: number;

  @ApiProperty({ example: 200, default: 200 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  maxPages?: number;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  screenshot?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  options?: Record<string, any>;
}
