export const generateFrontmatter = (urlProperty: string, value: string) => {
	const frontmatter = [];
	frontmatter.push("---");
	frontmatter.push(`${urlProperty}: ${value}`);
	frontmatter.push("---");
	return frontmatter.join("\n");
};
