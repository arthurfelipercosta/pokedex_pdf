import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { PDFConfig, MastersetInfo, PokemonIdentifier, Pokedex } from '../types/pokemon';
import { PAGE_SIZES } from '../data/constants';
import { parseIdentifier, getImagePath, getPokemonDisplayName, getPokemonTypes } from '../utils/pokemonId';

export class PDFGenerator {
  private pdfDoc: PDFDocument | null = null;
  private config: PDFConfig;
  private customFont: any;
  private mastersetInfo: MastersetInfo | null;
  private uniquePositionMap: Map<string, number>;
  private pokedex: Pokedex = {};

  constructor(config: PDFConfig, mastersetInfo?: MastersetInfo | null, uniquePositionMap?: Map<string, number>) {
    this.config = config;
    this.mastersetInfo = mastersetInfo ?? null;
    this.uniquePositionMap = uniquePositionMap ?? new Map();
  }

  async initialize(): Promise<void> {
    this.pdfDoc = await PDFDocument.create();
    this.pdfDoc.registerFontkit(fontkit);
    
    try {
      const fontBytes = await fetch('/pokedex/fontes/PokemonSolidNormal.ttf');
      const fontArrayBuffer = await fontBytes.arrayBuffer();
      this.customFont = await this.pdfDoc.embedFont(fontArrayBuffer);
    } catch (error) {
      console.error('Erro ao carregar fonte:', error);
      this.customFont = await this.pdfDoc.embedFont(StandardFonts.Helvetica);
    }

    try {
      const response = await fetch('/pokedex/pokedex.json');
      this.pokedex = await response.json();
    } catch (error) {
      console.error('Erro ao carregar pokedex:', error);
    }
  }

  private getImagePath(id: PokemonIdentifier): string {
    return getImagePath(id, this.config.visualMode, true);
  }

  private async loadPokemonImage(id: PokemonIdentifier): Promise<any> {
    if (!this.pdfDoc) return null;
    
    try {
      const imagePath = this.getImagePath(id);
      const imageBytes = await fetch(imagePath);
      const imageArrayBuffer = await imageBytes.arrayBuffer();
      return await this.pdfDoc.embedPng(imageArrayBuffer);
    } catch (error) {
      console.error(`Erro ao carregar imagem do Pokémon ${id}:`, error);
      return null;
    }
  }

  private async loadTypeIcon(type: string): Promise<any> {
    if (!this.pdfDoc) return null;
    
    try {
      const iconPath = `/pokedex/tipos_icones/${type}.png`;
      const iconBytes = await fetch(iconPath);
      const iconArrayBuffer = await iconBytes.arrayBuffer();
      return await this.pdfDoc.embedPng(iconArrayBuffer);
    } catch (error) {
      console.error(`Erro ao carregar ícone do tipo ${type}:`, error);
      return null;
    }
  }

  private getGridPosition(index: number, pageHeight: number) {
    const { margin, gridRows, gridCols } = this.config;
    const pageSize = PAGE_SIZES[this.config.pageSize];
    
    const usableWidth = pageSize.width - (margin * 2);
    const usableHeight = pageSize.height - (margin * 2);
    
    const cellWidth = usableWidth / gridCols;
    const cellHeight = usableHeight / gridRows;
    
    const row = Math.floor(index / gridCols);
    const col = index % gridCols;
    
    const x = margin + (col * cellWidth);
    const y = pageHeight - margin - ((row + 1) * cellHeight);
    
    return { x, y, cellWidth, cellHeight };
  }

  async addPage(pokemonList: PokemonIdentifier[], startIndex: number): Promise<void> {
    if (!this.pdfDoc) return;
    
    const pageSize = PAGE_SIZES[this.config.pageSize];
    const page = this.pdfDoc.addPage([pageSize.width, pageSize.height]);
    const { margin, gridRows, gridCols } = this.config;

    const usableWidth = pageSize.width - (margin * 2);
    const usableHeight = pageSize.height - (margin * 2);
    const gridTop = pageSize.height - margin;
    const gridLeft = margin;
    const gridRight = pageSize.width - margin;
    const gridBottom = margin;

    page.drawRectangle({
      x: gridLeft,
      y: gridBottom,
      width: usableWidth,
      height: usableHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1
    });

    const cellWidth = usableWidth / gridCols;
    for (let c = 1; c < gridCols; c++) {
      const x = gridLeft + c * cellWidth;
      page.drawLine({
        start: { x, y: gridBottom },
        end: { x, y: gridTop },
        color: rgb(0, 0, 0),
        thickness: 1
      });
    }

    const cellHeight = usableHeight / gridRows;
    for (let r = 1; r < gridRows; r++) {
      const y = gridBottom + r * cellHeight;
      page.drawLine({
        start: { x: gridLeft, y },
        end: { x: gridRight, y },
        color: rgb(0, 0, 0),
        thickness: 1
      });
    }

    for (let i = 0; i < pokemonList.length; i++) {
      const id = pokemonList[i];
      const globalIndex = startIndex + i;
      const displayNum = this.mastersetInfo
        ? this.uniquePositionMap.get(`${id}-${globalIndex}`) ?? (globalIndex + 1)
        : globalIndex + 1;
      const pos = this.getGridPosition(i, pageSize.height);
      const displayName = getPokemonDisplayName(id, this.pokedex);
      const { num } = parseIdentifier(id);
      const pokemonTypes = getPokemonTypes(id, this.pokedex);

      if (this.config.showNumbers) {
        let numText: string;
        if (this.config.numberingMode === 'tcg' && this.mastersetInfo?.setNumbers?.[globalIndex]) {
          numText = `#${this.mastersetInfo.setNumbers[globalIndex]}/${this.mastersetInfo.total}`;
        } else if (this.config.numberingMode === 'tcg' && this.mastersetInfo) {
          numText = `${displayNum.toString().padStart(3, '0')}/${this.mastersetInfo.total}`;
        } else {
          numText = `#${displayNum.toString().padStart(3, '0')}`;
        }
        page.drawText(numText, {
          x: pos.x + 5,
          y: pos.y + pos.cellHeight - 20,
          font: this.customFont,
          size: 12,
          color: rgb(0, 0, 0)
        });
      }

      if (this.config.showRarity && this.mastersetInfo && this.mastersetInfo.rarities[globalIndex]) {
        const rarityName = this.mastersetInfo.rarities[globalIndex];
        try {
          const iconPath = `/pokedex/symbols/${rarityName}.png`;
          const iconBytes = await fetch(iconPath);
          const iconArrayBuffer = await iconBytes.arrayBuffer();
          const rarityIcon = await this.pdfDoc!.embedPng(iconArrayBuffer);
          page.drawImage(rarityIcon, {
            x: pos.x + pos.cellWidth - 20,
            y: pos.y + pos.cellHeight - 20,
            width: 14,
            height: 14
          });
        } catch (error) {
          // Ícone não encontrado, ignorar
        }
      }

      const image = await this.loadPokemonImage(id);
      if (image) {
        const iconSpace = this.config.showTypeIcons ? 35 : 0;
        const nameSpace = this.config.showNames ? 18 : 0;
        const numSpace = this.config.showNumbers ? 25 : 0;
        const availableHeight = pos.cellHeight - numSpace - iconSpace - nameSpace;
        const availableWidth = pos.cellWidth - 10;
        const imageSize = Math.min(availableWidth * 0.8, availableHeight * 0.85);
        const imageX = pos.x + (pos.cellWidth - imageSize) / 2;
        const imageY = pos.y + iconSpace + nameSpace + (availableHeight - imageSize) / 2;
        page.drawImage(image, {
          x: imageX,
          y: imageY,
          width: imageSize,
          height: imageSize
        });
      }

      if (this.config.showNames) {
        const nameText = `${displayName} - ${String(num).padStart(3, '0')}`;
        const textWidth = this.customFont.widthOfTextAtSize(nameText, 10);
        page.drawText(nameText, {
          x: pos.x + (pos.cellWidth - textWidth) / 2,
          y: pos.y + 35,
          font: this.customFont,
          size: 10,
          color: rgb(0, 0, 0)
        });
      }

      if (this.config.showTypeIcons && pokemonTypes.length > 0) {
        const iconSize = 20;
        const gap = 5;
        const totalWidth = pokemonTypes.length * iconSize + (pokemonTypes.length - 1) * gap;
        const startX = pos.x + (pos.cellWidth - totalWidth) / 2;
        for (let j = 0; j < pokemonTypes.length; j++) {
          const icon = await this.loadTypeIcon(pokemonTypes[j]);
          if (icon) {
            page.drawImage(icon, {
              x: startX + j * (iconSize + gap),
              y: pos.y + 8,
              width: iconSize,
              height: iconSize
            });
          }
        }
      }
    }
  }

  async generate(pokemonList: PokemonIdentifier[]): Promise<Uint8Array> {
    await this.initialize();

    if (!this.pdfDoc) {
      throw new Error('PDF document not initialized');
    }

    const itemsPerPage = this.config.gridRows * this.config.gridCols;
    const pages = Math.ceil(pokemonList.length / itemsPerPage);

    for (let i = 0; i < pages; i++) {
      const startIndex = i * itemsPerPage;
      const pagePokemon = pokemonList.slice(startIndex, startIndex + itemsPerPage);
      await this.addPage(pagePokemon, startIndex);
    }

    return await this.pdfDoc.save();
  }
}

export async function generatePDF(pokemonList: PokemonIdentifier[], config: PDFConfig, mastersetInfo?: MastersetInfo | null, uniquePositionMap?: Map<string, number>): Promise<Uint8Array> {
  const generator = new PDFGenerator(config, mastersetInfo, uniquePositionMap);
  return await generator.generate(pokemonList);
}
