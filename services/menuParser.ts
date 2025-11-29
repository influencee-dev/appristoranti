import { FullMenu, MenuSection, MenuItem } from "../types";
import { v4 as uuidv4 } from "uuid"; // Note: In a real env we'd use a uuid lib, here we'll mock or use a simple random string generator

const generateId = () => Math.random().toString(36).substr(2, 9);

export const parseMenuText = (text: string): FullMenu => {
  const lines = text.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0);
  
  const sections: MenuSection[] = [];
  let currentSection: MenuSection | null = null;
  
  // Basic heuristics
  // 1. All Caps or ends with ':' -> Section Title
  // 2. Contains currency symbol or digits at end -> Item
  
  lines.forEach(line => {
    const isPrice = /[\d.,]+(\s?€|\$|£)/.test(line) || /(\s?€|\$|£)\s?[\d.,]+/.test(line);
    const isHeader = (line === line.toUpperCase() && line.length > 3) || line.endsWith(":");
    
    if (isHeader && !isPrice) {
      // It's a section
      currentSection = {
        id: generateId(),
        title: line.replace(/:$/, ""),
        items: []
      };
      sections.push(currentSection);
    } else {
      // It's an item or description
      // Extract price if present
      let price = "";
      let name = line;
      
      const priceMatch = line.match(/([\d.,]+(\s?€|\$|£))/) || line.match(/((\s?€|\$|£)\s?[\d.,]+)/);
      if (priceMatch) {
        price = priceMatch[0];
        name = line.replace(price, "").trim();
        // Remove trailing dashes often used like "Pizza - 10€"
        name = name.replace(/[-–—]+$/, "").trim();
      }

      const item: MenuItem = {
        id: generateId(),
        name: name,
        price: price,
        description: "" // Parser is simple, hard to distinguish desc from next line without context
      };

      if (currentSection) {
        currentSection.items.push(item);
      } else {
        // Create a default section if none exists
        currentSection = {
          id: generateId(),
          title: "General",
          items: [item]
        };
        sections.push(currentSection);
      }
    }
  });

  return {
    title: "Imported Menu",
    sections: sections,
    footerNote: ""
  };
};