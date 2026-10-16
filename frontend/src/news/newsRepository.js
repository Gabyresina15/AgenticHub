import articles from 'virtual:news';

export function getAllNews() {
  return articles;
}

export function getNewsBySlug(slug) {
  return articles.find((article) => article.slug === slug) ?? null;
}
