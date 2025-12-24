import { compile, serialize, stringify, middleware, prefixer, Middleware } from 'stylis';

/**
 * Scopes a CSS string to a specific ID using stylis.
 * Input:  "button { color: red; }"
 * Scope:  "mnee-scope-123"
 * Output: "#mnee-scope-123 button { color: red; }"
 */
export function processScopedStyles(scopeId: string, css: string): string {
  if (!css || !scopeId) return '';

  try {
    const scopedMiddleware: Middleware = (element) => {
      if (element.type === 'rule') {
        if (Array.isArray(element.props)) {
            element.props = element.props.map((sel: string) => {
            if (sel.includes(scopeId)) return sel;
            
            if (sel.match(/(html|body|:root)/)) {
                return sel.replace(/(html|body|:root)/g, `#${scopeId}`);
            }

            return `#${scopeId} ${sel}`;
          });
        }
      }
    };

    return serialize(
      compile(css),
      middleware([scopedMiddleware, prefixer, stringify])
    );
  } catch (error) {
    console.error('[MNEE Pay] Failed to compile custom CSS:', error);
    return '';
  }
}