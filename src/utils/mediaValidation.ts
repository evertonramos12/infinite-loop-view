
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

// Valida URL de imagem: permite postimg, canva, terminações clássicas (.jpg, .png, etc)
export function validateImageUrl(value: string): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    if (
      /\.(jpe?g|png|gif|webp)$/i.test(url.pathname) ||
      // Aceita especificamente domínios comuns para imagens
      url.hostname.includes('postimg.cc') ||
      url.hostname.includes('i.postimg.cc') ||
      url.hostname.includes('canva.com')
    ) {
      return true;
    }
    return false;
  } catch {
    try {
      const url = new URL('https://' + value);
      if (
        /\.(jpe?g|png|gif|webp)$/i.test(url.pathname) ||
        url.hostname.includes('postimg.cc') ||
        url.hostname.includes('i.postimg.cc') ||
        url.hostname.includes('canva.com')
      ) {
        return true;
      }
      return false;
    } catch {
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
