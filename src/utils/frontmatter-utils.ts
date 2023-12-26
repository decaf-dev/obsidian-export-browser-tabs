export const getFrontmatterForFile = (urlFrontmatterKey: string, value: string) => {
	const frontmatter = [];
	frontmatter.push("---");
	frontmatter.push(`${urlFrontmatterKey}: ${value}`);
	frontmatter.push("---");
	return frontmatter.join("\n");
}
