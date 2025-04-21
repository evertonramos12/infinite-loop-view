
export type MediaType = 'video' | 'image';

// Normaliza a URL para garantir que tenha https:// se necessário
export function normalizeUrl(value: string) {
  try {
    new URL(value);
    return value;
  } catch {
    try {
      new URL('https://' + value);
      return 'https://' + value;
    } catch {
      return value;
    }
  }
}

// Valida URL de imagem: permite links simples, postimg, canva, terminações clássicas (.jpg, .png, etc)
export function validateImageUrl(value: string): boolean {
  if (!value) return false;
  
  // Aceita qualquer URL que termine com extensão de imagem comum
  const imageExtensions = /\.(jpe?g|png|gif|webp|svg|bmp|tiff?)$/i;
  
  try {
    // Tenta criar um objeto URL para verificar se é uma URL válida
    const url = new URL(value);
    
    // Aceita URLs que terminam com extensões de imagem
    if (imageExtensions.test(url.pathname)) {
      return true;
    }
    
    // Aceita domínios específicos populares para imagens
    if (
      url.hostname.includes('postimg.cc') ||
      url.hostname.includes('i.postimg.cc') ||
      url.hostname.includes('canva.com') ||
      url.hostname.includes('imgur.com') ||
      url.hostname.includes('ibb.co') ||
      url.hostname.includes('cloudinary.com')
    ) {
      return true;
    }
    
    // Para outros domínios, aceita se parecer uma URL de imagem
    // (muitos sites usam URLs sem extensão de arquivo para imagens)
    if (
      url.pathname.includes('/image') || 
      url.pathname.includes('/img') || 
      url.pathname.includes('/photo') ||
      url.search.includes('image')
    ) {
      return true;
    }
    
    // Para URLs que não se enquadram nas regras acima, vamos aceitar como imagem se for http/https
    // O usuário terá feedback visual se não for uma imagem válida quando tentar visualizá-la
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return true;
    }
    
    return false;
  } catch {
    try {
      // Tenta prefixar com https:// se falhou anteriormente
      const url = new URL('https://' + value);
      
      if (imageExtensions.test(url.pathname)) {
        return true;
      }
      
      if (
        url.hostname.includes('postimg.cc') ||
        url.hostname.includes('i.postimg.cc') ||
        url.hostname.includes('canva.com') ||
        url.hostname.includes('imgur.com') ||
        url.hostname.includes('ibb.co') ||
        url.hostname.includes('cloudinary.com')
      ) {
        return true;
      }
      
      if (
        url.pathname.includes('/image') || 
        url.pathname.includes('/img') || 
        url.pathname.includes('/photo') ||
        url.search.includes('image')
      ) {
        return true;
      }
      
      // Mesma regra - aceitamos qualquer URL HTTP/HTTPS como potencial imagem
      return true;
    } catch {
      // Se não conseguir analisar como URL, verificamos se parece uma extensão de arquivo de imagem
      if (imageExtensions.test(value)) {
        return true;
      }
      
      return false;
    }
  }
}

// Valida URL de vídeo: qualquer domínio aceito, garante canva também
export function validateVideoUrl(value: string): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    // Aceita videos do canva e libera para possíveis outros
    if (url.hostname.includes('canva.com')) return true;
    return true;
  } catch {
    try {
      const url = new URL('https://' + value);
      if (url.hostname.includes('canva.com')) return true;
      return true;
    } catch {
      return false;
    }
  }
}
