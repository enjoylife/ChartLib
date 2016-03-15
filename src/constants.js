

/**
 * The default margin between a graph and the outer svg container
 */
export const margin = { top: 20, right: 20, bottom: 20, left: 20};

const DESC = 'desc';
const ASC = 'asc';


/**
 * the possible ways to sort
 */
export const sortDirection = {
  ascending : ASC, descending: DESC
};


/**
 * Default smallest dimensions for a visualization
 */
export const minDimensions = {
    width : 300,
    height: 300
}

/**
 * Default larget dimensions for a visualization
 */
export const maxDimensions = {
    width: 700,
    height: 700,
}

/**
 * The various breakpoints for repsonsive and dynamic sizing
 */
export const breakpoints = {
    sm: 400,
    md: 700,
    lg: 1200
}

/**
 * Helper to map element widths to our breakpoint defaults
 */
export function getBreakpoint(width) {
    switch (width) {
        case width < breakpoints.sm:
            return breakpoints.sm;
        case width < breakpoints.md:
            return breakpoints.md;           
        case width < breakpoints.lg:
        default:
            return breakpoints.lg;
    }
}
