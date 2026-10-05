import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type { PDFConfig, MastersetInfo, PokemonIdentifier, Pokedex } from '../types/pokemon';
import { PAGE_SIZES } from '../data/constants';
import { parseIdentifier, getImagePath, getPokemonDisplayName, getPokemonTypes, isSpecialCard, parseSpecialCard, getSpecialCardLabel, getEnergyImageSlug, getEnergyImagePath } from '../utils/pokemonId';

export class PDFGenerator {
  private pdfDoc: PDFDocument | null = null;
  private config: PDFConfig;
  private customFont: any;
  private mastersetInfo: MastersetInfo | null;
  private uniquePositionMap: Map<string, number>;
  private pokedex: Pokedex = {};
  private typeIconCache: Map<string, any> = new Map();
  private rarityIconCache: Map<string, any> = new Map();
  private imagensCache: Map<string, any> = new Map();

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
    if (this.typeIconCache.has(type)) return this.typeIconCache.get(type);
    if (!this.pdfDoc) return null;

    try {
      const iconPath = `/pokedex/tipos_icones/${type}.png`;
      const iconBytes = await fetch(iconPath);
      const iconArrayBuffer = await iconBytes.arrayBuffer();
      const icon = await this.pdfDoc.embedPng(iconArrayBuffer);
      this.typeIconCache.set(type, icon);
      return icon;
    } catch (error) {
      console.error(`Erro ao carregar ícone do tipo ${type}:`, error);
      return null;
    }
  }

  private async loadRarityIcon(rarityName: string): Promise<any> {
    if (this.rarityIconCache.has(rarityName)) return this.rarityIconCache.get(rarityName);
    if (!this.pdfDoc) return null;

    try {
      const iconPath = `/pokedex/symbols/${rarityName}.png`;
      const iconBytes = await fetch(iconPath);
      const iconArrayBuffer = await iconBytes.arrayBuffer();
      const icon = await this.pdfDoc.embedPng(iconArrayBuffer);
      this.rarityIconCache.set(rarityName, icon);
      return icon;
    } catch (error) {
      return null;
    }
  };

  private async carregarEmLotes<T>(items: T[], loader: (item: T) => Promise<any>, tamanhoLote = 25): Promise<any[]> {
    const resultados: any[] = [];
    for (let i = 0; i < items.length; i += tamanhoLote) {
      const lote = items.slice(i, i + tamanhoLote);
      const resultadosLote = await Promise.all(lote.map(loader));
      resultados.push(...resultadosLote);
    }
    return resultados;
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
      if (isSpecialCard(id)) {
        const card = parseSpecialCard(id)!;
        const { category, subcategory } = getSpecialCardLabel(card);
        const pos = this.getGridPosition(i, pageSize.height);
        const globalIndex = startIndex + i;

        // Calculate card number
        let cardNumber: string;
        if (this.config.numberingMode === 'tcg' && this.mastersetInfo?.setNumbers?.[globalIndex]) {
          cardNumber = `#${this.mastersetInfo.setNumbers[globalIndex]}/${this.mastersetInfo.total}`;
        } else if (this.config.numberingMode === 'tcg' && this.mastersetInfo) {
          const displayNum = this.mastersetInfo
            ? this.uniquePositionMap.get(`${id}-${globalIndex}`) ?? (globalIndex + 1)
            : globalIndex + 1;
          cardNumber = `${displayNum.toString().padStart(3, '0')}/${this.mastersetInfo.total}`;
        } else {
          const displayNum = this.mastersetInfo
            ? this.uniquePositionMap.get(`${id}-${globalIndex}`) ?? (globalIndex + 1)
            : globalIndex + 1;
          cardNumber = `#${displayNum.toString().padStart(3, '0')}`;
        }

        // Draw rarity icon on the left at top
        if (this.config.showRarity && this.mastersetInfo && this.mastersetInfo.rarities[globalIndex]) {
          const rarityName = this.mastersetInfo.rarities[globalIndex];
          const rarityIcon = await this.loadRarityIcon(rarityName);
          if (rarityIcon) {
            page.drawImage(rarityIcon, {
              x: pos.x + pos.cellWidth - 20,
              y: pos.y + pos.cellHeight - 20,
              width: 14,
              height: 14
            });
          }
        }

        // Draw card number on the right at top
        if (this.config.showNumbers) {
          const numWidth = this.customFont.widthOfTextAtSize(cardNumber, 12);
          page.drawText(cardNumber, {
            x: pos.x + pos.cellWidth - numWidth - 5,
            y: pos.y + pos.cellHeight - 20,
            font: this.customFont,
            size: 12,
            color: rgb(0, 0, 0)
          });
        }

        // Draw name centered vertically
        const nameWidth = this.customFont.widthOfTextAtSize(card.name, 11);
        page.drawText(card.name, {
          x: pos.x + (pos.cellWidth - nameWidth) / 2,
          y: pos.y + pos.cellHeight / 2,
          font: this.customFont,
          size: 11,
          color: rgb(0, 0, 0)
        });

        // Draw category centered at bottom
        const categoryWidth = this.customFont.widthOfTextAtSize(category, 9);
        page.drawText(category, {
          x: pos.x + (pos.cellWidth - categoryWidth) / 2,
          y: pos.y + 25,
          font: this.customFont,
          size: 9,
          color: rgb(0, 0, 0)
        });

        // Draw subcategory on the right at bottom
        page.drawText(subcategory, {
          x: pos.x + pos.cellWidth - 35,
          y: pos.y + 25,
          font: this.customFont,
          size: 9,
          color: rgb(0, 0, 0)
        });

        const slug = getEnergyImageSlug(card);
        if (slug) {
          const imgPath = getEnergyImagePath(slug, this.config.visualMode, true);
          try {
            const imgBytes = await fetch(imgPath);
            const imgArrayBuffer = await imgBytes.arrayBuffer();
            const img = await this.pdfDoc!.embedPng(imgArrayBuffer);
            page.drawImage(img, { x: pos.x + (pos.cellWidth - 40) / 2, y: pos.y + 30, width: 40, height: 40 });
          } catch { }
        }
        continue;
      }
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
        const rarityIcon = await this.loadRarityIcon(rarityName);
        if (rarityIcon) {
          page.drawImage(rarityIcon, {
            x: pos.x + pos.cellWidth - 20,
            y: pos.y + pos.cellHeight - 20,
            width: 14,
            height: 14
          });
        }
      }

      const image = this.imagensCache.get(`${id}-${globalIndex}`);
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

    const imagensCarregadas = await this.carregarEmLotes(pokemonList, (id) => this.loadPokemonImage(id));
    this.imagensCache = new Map(pokemonList.map((id, idx) => [`${id}-${idx}`, imagensCarregadas[idx]]));

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
