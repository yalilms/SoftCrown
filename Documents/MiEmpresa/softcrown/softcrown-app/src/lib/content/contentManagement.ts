// Content Management Service
export interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'gallery' | 'button' | 'form' | 'code' | 'divider';
  content: any;
  styles: ContentStyles;
  metadata: ContentMetadata;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentStyles {
  className?: string;
  customCSS?: string;
  layout?: {
    width?: string;
    height?: string;
    margin?: string;
    padding?: string;
    alignment?: 'left' | 'center' | 'right' | 'justify';
  };
  typography?: {
    fontSize?: string;
    fontWeight?: string;
    fontFamily?: string;
    color?: string;
    lineHeight?: string;
  };
  background?: {
    color?: string;
    image?: string;
    gradient?: string;
  };
  border?: {
    width?: string;
    style?: string;
    color?: string;
    radius?: string;
  };
  animation?: {
    type?: string;
    duration?: string;
    delay?: string;
  };
}

export interface ContentMetadata {
  title?: string;
  description?: string;
  tags?: string[];
  author?: string;
  lastEditor?: string;
  isPublished?: boolean;
  publishedAt?: Date;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export interface ContentPage {
  id: string;
  slug: string;
  title: string;
  description: string;
  blocks: ContentBlock[];
  template: string;
  metadata: ContentMetadata;
  versions: ContentVersion[];
  currentVersion: number;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentVersion {
  id: string;
  version: number;
  blocks: ContentBlock[];
  metadata: ContentMetadata;
  author: string;
  comment?: string;
  createdAt: Date;
}

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'page' | 'section' | 'component';
  preview: string;
  blocks: Partial<ContentBlock>[];
  variables?: Record<string, any>;
}

export interface MediaAsset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  alt?: string;
  caption?: string;
  tags?: string[];
  folder?: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface ContentSearchResult {
  id: string;
  type: 'page' | 'block' | 'asset';
  title: string;
  description: string;
  url?: string;
  thumbnail?: string;
  relevance: number;
  lastModified: Date;
}

export class ContentManagementService {
  private pages: Map<string, ContentPage> = new Map();
  private templates: Map<string, ContentTemplate> = new Map();
  private assets: Map<string, MediaAsset> = new Map();
  private currentEditingPage: string | null = null;
  private isEditMode: boolean = false;
  private autosaveInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeTemplates();
    this.loadContent();
    this.setupAutosave();
  }

  // Page Management
  createPage(title: string, template?: string): ContentPage {
    const page: ContentPage = {
      id: `page-${Date.now()}`,
      slug: this.generateSlug(title),
      title,
      description: '',
      blocks: template ? this.getTemplateBlocks(template) : [],
      template: template || 'blank',
      metadata: {
        title,
        description: '',
        tags: [],
        author: 'current-user',
        isPublished: false,
      },
      versions: [],
      currentVersion: 1,
      isPublished: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.pages.set(page.id, page);
    this.saveContent();
    return page;
  }

  getPage(id: string): ContentPage | null {
    return this.pages.get(id) || null;
  }

  getPageBySlug(slug: string): ContentPage | null {
    for (const page of this.pages.values()) {
      if (page.slug === slug) {
        return page;
      }
    }
    return null;
  }

  getAllPages(): ContentPage[] {
    return Array.from(this.pages.values());
  }

  updatePage(id: string, updates: Partial<ContentPage>): void {
    const page = this.pages.get(id);
    if (!page) return;

    const updatedPage = {
      ...page,
      ...updates,
      updatedAt: new Date(),
    };

    this.pages.set(id, updatedPage);
    this.saveContent();
  }

  deletePage(id: string): boolean {
    const deleted = this.pages.delete(id);
    if (deleted) {
      this.saveContent();
    }
    return deleted;
  }

  publishPage(id: string): void {
    const page = this.pages.get(id);
    if (!page) return;

    page.isPublished = true;
    page.publishedAt = new Date();
    page.metadata.isPublished = true;
    page.metadata.publishedAt = new Date();

    this.pages.set(id, page);
    this.saveContent();
  }

  unpublishPage(id: string): void {
    const page = this.pages.get(id);
    if (!page) return;

    page.isPublished = false;
    page.metadata.isPublished = false;

    this.pages.set(id, page);
    this.saveContent();
  }

  // Block Management
  addBlock(pageId: string, block: Partial<ContentBlock>, index?: number): ContentBlock {
    const page = this.pages.get(pageId);
    if (!page) throw new Error('Page not found');

    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type: block.type || 'text',
      content: block.content || this.getDefaultContent(block.type || 'text'),
      styles: block.styles || {},
      metadata: block.metadata || {},
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (index !== undefined && index >= 0 && index <= page.blocks.length) {
      page.blocks.splice(index, 0, newBlock);
    } else {
      page.blocks.push(newBlock);
    }

    page.updatedAt = new Date();
    this.pages.set(pageId, page);
    this.saveContent();

    return newBlock;
  }

  updateBlock(pageId: string, blockId: string, updates: Partial<ContentBlock>): void {
    const page = this.pages.get(pageId);
    if (!page) return;

    const blockIndex = page.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;

    const updatedBlock = {
      ...page.blocks[blockIndex],
      ...updates,
      updatedAt: new Date(),
    };

    page.blocks[blockIndex] = updatedBlock;
    page.updatedAt = new Date();
    this.pages.set(pageId, page);
    this.saveContent();
  }

  deleteBlock(pageId: string, blockId: string): boolean {
    const page = this.pages.get(pageId);
    if (!page) return false;

    const blockIndex = page.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return false;

    page.blocks.splice(blockIndex, 1);
    page.updatedAt = new Date();
    this.pages.set(pageId, page);
    this.saveContent();

    return true;
  }

  moveBlock(pageId: string, blockId: string, newIndex: number): void {
    const page = this.pages.get(pageId);
    if (!page) return;

    const blockIndex = page.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;

    const [block] = page.blocks.splice(blockIndex, 1);
    page.blocks.splice(newIndex, 0, block);

    page.updatedAt = new Date();
    this.pages.set(pageId, page);
    this.saveContent();
  }

  duplicateBlock(pageId: string, blockId: string): ContentBlock | null {
    const page = this.pages.get(pageId);
    if (!page) return null;

    const block = page.blocks.find(b => b.id === blockId);
    if (!block) return null;

    const duplicatedBlock: ContentBlock = {
      ...block,
      id: `block-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const blockIndex = page.blocks.findIndex(b => b.id === blockId);
    page.blocks.splice(blockIndex + 1, 0, duplicatedBlock);

    page.updatedAt = new Date();
    this.pages.set(pageId, page);
    this.saveContent();

    return duplicatedBlock;
  }

  // Version Management
  createVersion(pageId: string, comment?: string): ContentVersion {
    const page = this.pages.get(pageId);
    if (!page) throw new Error('Page not found');

    const version: ContentVersion = {
      id: `version-${Date.now()}`,
      version: page.currentVersion + 1,
      blocks: JSON.parse(JSON.stringify(page.blocks)),
      metadata: JSON.parse(JSON.stringify(page.metadata)),
      author: 'current-user',
      comment,
      createdAt: new Date(),
    };

    page.versions.push(version);
    page.currentVersion = version.version;
    page.updatedAt = new Date();

    this.pages.set(pageId, page);
    this.saveContent();

    return version;
  }

  restoreVersion(pageId: string, versionId: string): void {
    const page = this.pages.get(pageId);
    if (!page) return;

    const version = page.versions.find(v => v.id === versionId);
    if (!version) return;

    page.blocks = JSON.parse(JSON.stringify(version.blocks));
    page.metadata = JSON.parse(JSON.stringify(version.metadata));
    page.updatedAt = new Date();

    this.pages.set(pageId, page);
    this.saveContent();
  }

  // Media Management
  uploadAsset(file: File, folder?: string): Promise<MediaAsset> {
    return new Promise((resolve) => {
      // Mock upload - in real implementation, upload to cloud storage
      const asset: MediaAsset = {
        id: `asset-${Date.now()}`,
        filename: `${Date.now()}-${file.name}`,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        folder: folder || 'uploads',
        uploadedBy: 'current-user',
        uploadedAt: new Date(),
      };

      // Generate thumbnail for images
      if (file.type.startsWith('image/')) {
        asset.thumbnailUrl = asset.url; // In real implementation, generate thumbnail
      }

      this.assets.set(asset.id, asset);
      this.saveAssets();
      resolve(asset);
    });
  }

  getAsset(id: string): MediaAsset | null {
    return this.assets.get(id) || null;
  }

  getAllAssets(folder?: string): MediaAsset[] {
    const assets = Array.from(this.assets.values());
    return folder ? assets.filter(asset => asset.folder === folder) : assets;
  }

  updateAsset(id: string, updates: Partial<MediaAsset>): void {
    const asset = this.assets.get(id);
    if (!asset) return;

    const updatedAsset = { ...asset, ...updates };
    this.assets.set(id, updatedAsset);
    this.saveAssets();
  }

  deleteAsset(id: string): boolean {
    const deleted = this.assets.delete(id);
    if (deleted) {
      this.saveAssets();
    }
    return deleted;
  }

  // Search
  searchContent(query: string): ContentSearchResult[] {
    const results: ContentSearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // Search pages
    for (const page of this.pages.values()) {
      if (
        page.title.toLowerCase().includes(lowerQuery) ||
        page.description.toLowerCase().includes(lowerQuery) ||
        page.metadata.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      ) {
        results.push({
          id: page.id,
          type: 'page',
          title: page.title,
          description: page.description,
          url: `/${page.slug}`,
          relevance: this.calculateRelevance(query, page.title + ' ' + page.description),
          lastModified: page.updatedAt,
        });
      }
    }

    // Search assets
    for (const asset of this.assets.values()) {
      if (
        asset.originalName.toLowerCase().includes(lowerQuery) ||
        asset.alt?.toLowerCase().includes(lowerQuery) ||
        asset.caption?.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          id: asset.id,
          type: 'asset',
          title: asset.originalName,
          description: asset.caption || asset.alt || '',
          url: asset.url,
          thumbnail: asset.thumbnailUrl,
          relevance: this.calculateRelevance(query, asset.originalName),
          lastModified: asset.uploadedAt,
        });
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance);
  }

  // Edit Mode
  enableEditMode(pageId?: string): void {
    this.isEditMode = true;
    this.currentEditingPage = pageId || null;
    document.body.classList.add('cms-edit-mode');
  }

  disableEditMode(): void {
    this.isEditMode = false;
    this.currentEditingPage = null;
    document.body.classList.remove('cms-edit-mode');
  }

  isInEditMode(): boolean {
    return this.isEditMode;
  }

  getCurrentEditingPage(): string | null {
    return this.currentEditingPage;
  }

  // Templates
  getTemplates(category?: string): ContentTemplate[] {
    const templates = Array.from(this.templates.values());
    return category ? templates.filter(t => t.category === category) : templates;
  }

  getTemplate(id: string): ContentTemplate | null {
    return this.templates.get(id) || null;
  }

  // Export/Import
  exportPage(id: string): string {
    const page = this.pages.get(id);
    if (!page) throw new Error('Page not found');

    return JSON.stringify(page, null, 2);
  }

  importPage(data: string): ContentPage {
    try {
      const page = JSON.parse(data) as ContentPage;
      page.id = `page-${Date.now()}`;
      page.slug = this.generateSlug(page.title);
      page.createdAt = new Date();
      page.updatedAt = new Date();

      this.pages.set(page.id, page);
      this.saveContent();

      return page;
    } catch (error) {
      throw new Error(`Failed to import page: ${error}`);
    }
  }

  // Private Methods
  private initializeTemplates(): void {
    // Landing Page Template
    this.templates.set('landing', {
      id: 'landing',
      name: 'Landing Page',
      description: 'Página de aterrizaje con hero, características y CTA',
      category: 'page',
      preview: '/templates/landing.jpg',
      blocks: [
        {
          type: 'text',
          content: { html: '<h1>Título Principal</h1><p>Subtítulo descriptivo</p>' },
          styles: { className: 'hero-section' },
        },
        {
          type: 'image',
          content: { src: '/placeholder-hero.jpg', alt: 'Hero Image' },
          styles: { layout: { width: '100%' } },
        },
        {
          type: 'text',
          content: { html: '<h2>Características</h2>' },
          styles: { className: 'features-section' },
        },
        {
          type: 'button',
          content: { text: 'Comenzar Ahora', href: '#contact' },
          styles: { className: 'cta-button' },
        },
      ],
    });

    // Blog Post Template
    this.templates.set('blog', {
      id: 'blog',
      name: 'Blog Post',
      description: 'Plantilla para artículos de blog',
      category: 'page',
      preview: '/templates/blog.jpg',
      blocks: [
        {
          type: 'text',
          content: { html: '<h1>Título del Artículo</h1>' },
          styles: { className: 'article-title' },
        },
        {
          type: 'text',
          content: { html: '<p class="meta">Por Autor • Fecha</p>' },
          styles: { className: 'article-meta' },
        },
        {
          type: 'image',
          content: { src: '/placeholder-article.jpg', alt: 'Featured Image' },
          styles: { layout: { width: '100%' } },
        },
        {
          type: 'text',
          content: { html: '<p>Contenido del artículo...</p>' },
          styles: { className: 'article-content' },
        },
      ],
    });
  }

  private getTemplateBlocks(templateId: string): ContentBlock[] {
    const template = this.templates.get(templateId);
    if (!template) return [];

    return template.blocks.map((block, index) => ({
      id: `block-${Date.now()}-${index}`,
      type: block.type || 'text',
      content: block.content || this.getDefaultContent(block.type || 'text'),
      styles: block.styles || {},
      metadata: block.metadata || {},
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  private getDefaultContent(type: string): any {
    switch (type) {
      case 'text':
        return { html: '<p>Nuevo contenido de texto</p>' };
      case 'image':
        return { src: '/placeholder.jpg', alt: 'Imagen' };
      case 'video':
        return { src: '', poster: '/placeholder-video.jpg' };
      case 'button':
        return { text: 'Botón', href: '#' };
      case 'form':
        return { fields: [], action: '' };
      case 'code':
        return { code: '// Código aquí', language: 'javascript' };
      case 'divider':
        return { style: 'solid' };
      case 'gallery':
        return { images: [] };
      default:
        return {};
    }
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private calculateRelevance(query: string, text: string): number {
    const lowerQuery = query.toLowerCase();
    const lowerText = text.toLowerCase();
    
    if (lowerText === lowerQuery) return 100;
    if (lowerText.startsWith(lowerQuery)) return 90;
    if (lowerText.includes(lowerQuery)) return 70;
    
    const words = lowerQuery.split(' ');
    const matchedWords = words.filter(word => lowerText.includes(word));
    return (matchedWords.length / words.length) * 50;
  }

  private setupAutosave(): void {
    this.autosaveInterval = setInterval(() => {
      if (this.isEditMode && this.currentEditingPage) {
        this.saveContent();
      }
    }, 30000); // Autosave every 30 seconds
  }

  private saveContent(): void {
    if (typeof window !== 'undefined') {
      const pages = Array.from(this.pages.values());
      localStorage.setItem('cms-pages', JSON.stringify(pages));
    }
  }

  private saveAssets(): void {
    if (typeof window !== 'undefined') {
      const assets = Array.from(this.assets.values());
      localStorage.setItem('cms-assets', JSON.stringify(assets));
    }
  }

  private loadContent(): void {
    if (typeof window !== 'undefined') {
      // Load pages
      const savedPages = localStorage.getItem('cms-pages');
      if (savedPages) {
        try {
          const pages = JSON.parse(savedPages) as ContentPage[];
          pages.forEach(page => {
            this.pages.set(page.id, page);
          });
        } catch (error) {
          console.warn('Failed to load saved pages');
        }
      }

      // Load assets
      const savedAssets = localStorage.getItem('cms-assets');
      if (savedAssets) {
        try {
          const assets = JSON.parse(savedAssets) as MediaAsset[];
          assets.forEach(asset => {
            this.assets.set(asset.id, asset);
          });
        } catch (error) {
          console.warn('Failed to load saved assets');
        }
      }
    }
  }
}

// Export singleton instance
export const contentManagement = new ContentManagementService();
