export default function NewsTags({ tags }) {
  if (tags.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Etiquetas">
      {tags.map((tag) => (
        <li key={tag} className="text-xs font-bold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-2 py-1 rounded">
          #{tag}
        </li>
      ))}
    </ul>
  );
}
