import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePageDto {
  @ApiProperty({ example: 'cuid123', description: 'Project ID' })
  @IsString()
  projectId: string;

  @ApiProperty({ example: '/locations/phoenix', description: 'Page path/URL' })
  @IsString()
  path: string;

  @ApiProperty({ example: 'Phoenix Location', description: 'Page title' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'phoenix-location', description: 'URL slug', required: false })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ example: false, description: 'Is this the homepage?', required: false })
  @IsBoolean()
  @IsOptional()
  isHomepage?: boolean;

  @ApiProperty({ example: 'location', description: 'Page template type', required: false })
  @IsString()
  @IsOptional()
  template?: string;
}
