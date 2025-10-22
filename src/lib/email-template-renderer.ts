/**
 * Email Template Renderer
 * Lightweight Handlebars-style template processor for email HTML templates
 */

interface TemplateData {
  [key: string]: any;
}

/**
 * Load an HTML email template from the public folder
 */
export async function loadTemplate(templateName: string): Promise<string> {
  try {
    const response = await fetch(`/email-templates/${templateName}.html`);
    if (!response.ok) {
      throw new Error(`Failed to load template: ${templateName}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Template loading error:', error);
    throw error;
  }
}

/**
 * Replace simple {{VARIABLE}} placeholders with values
 */
function replaceVariables(template: string, data: TemplateData): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? String(data[key]) : '';
  });
}

/**
 * Process {{#if VARIABLE}}...{{/if}} conditional blocks
 */
function processConditionals(template: string, data: TemplateData): string {
  const conditionalRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  
  return template.replace(conditionalRegex, (match, variable, content) => {
    const value = data[variable];
    // Show content if variable exists and is not empty array
    if (value && (!Array.isArray(value) || value.length > 0)) {
      return content;
    }
    return '';
  });
}

/**
 * Process nested {{#if this.property}} conditionals within loops
 */
function processNestedConditionals(template: string, item: any): string {
  const nestedConditionalRegex = /\{\{#if\s+this\.(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  
  return template.replace(nestedConditionalRegex, (match, property, content) => {
    return item[property] ? content : '';
  });
}

/**
 * Process {{#each ARRAY}}...{{/each}} loop blocks
 */
function processLoops(template: string, data: TemplateData): string {
  const loopRegex = /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
  
  return template.replace(loopRegex, (match, arrayName, itemTemplate) => {
    const array = data[arrayName];
    
    if (!Array.isArray(array) || array.length === 0) {
      return '';
    }
    
    return array.map(item => {
      // Process nested conditionals first
      let processedTemplate = processNestedConditionals(itemTemplate, item);
      
      // Replace {{this.property}} references
      processedTemplate = processedTemplate.replace(/\{\{this\.(\w+)\}\}/g, (m, key) => {
        return item[key] !== undefined ? String(item[key]) : '';
      });
      
      return processedTemplate;
    }).join('');
  });
}

/**
 * Main template rendering function
 */
export function renderTemplate(template: string, data: TemplateData): string {
  // Process in order: loops first, then conditionals, then simple variables
  let result = template;
  result = processLoops(result, data);
  result = processConditionals(result, data);
  result = replaceVariables(result, data);
  return result;
}

/**
 * Load and render a template in one call
 */
export async function loadAndRenderTemplate(
  templateName: string,
  data: TemplateData
): Promise<string> {
  const template = await loadTemplate(templateName);
  return renderTemplate(template, data);
}
