import { Stablecoin } from "..//types";

// ============================================================================
// Token Contract Addresses by Chain
// ============================================================================

/**
 * ERC-20 stablecoin contract addresses for each supported chain.
 *
 * Sources:
 * - Ethereum: Circle (USDC), Tether (USDT), MakerDAO (DAI), PayPal (PYUSD)
 * - Base: Native USDC, bridged stablecoins
 * - Arbitrum: Bridged versions of mainnet tokens
 * - Optimism: Bridged versions of mainnet tokens
 * - Polygon: Native/bridged versions
 */

export const TOKEN_SVGS: Record<Stablecoin, string> = {
  USDC: "data:image/svg+xml;base64,PHN2ZyBkYXRhLW5hbWU9Ijg2OTc3Njg0LTEyZGItNDg1MC04ZjMwLTIzM2E3YzI2N2QxMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMjAwMCAyMDAwIj4KICA8cGF0aCBkPSJNMTAwMCAyMDAwYzU1NC4xNyAwIDEwMDAtNDQ1LjgzIDEwMDAtMTAwMFMxNTU0LjE3IDAgMTAwMCAwIDAgNDQ1LjgzIDAgMTAwMHM0NDUuODMgMTAwMCAxMDAwIDEwMDB6IiBmaWxsPSIjMjc3NWNhIi8+CiAgPHBhdGggZD0iTTEyNzUgMTE1OC4zM2MwLTE0NS44My04Ny41LTE5NS44My0yNjIuNS0yMTYuNjYtMTI1LTE2LjY3LTE1MC01MC0xNTAtMTA4LjM0czQxLjY3LTk1LjgzIDEyNS05NS44M2M3NSAwIDExNi42NyAyNSAxMzcuNSA4Ny41IDQuMTcgMTIuNSAxNi42NyAyMC44MyAyOS4xNyAyMC44M2g2Ni42NmMxNi42NyAwIDI5LjE3LTEyLjUgMjkuMTctMjkuMTZ2LTQuMTdjLTE2LjY3LTkxLjY3LTkxLjY3LTE2Mi41LTE4Ny41LTE3MC44M3YtMTAwYzAtMTYuNjctMTIuNS0yOS4xNy0zMy4zMy0zMy4zNGgtNjIuNWMtMTYuNjcgMC0yOS4xNyAxMi41LTMzLjM0IDMzLjM0djk1LjgzYy0xMjUgMTYuNjctMjA0LjE2IDEwMC0yMDQuMTYgMjA0LjE3IDAgMTM3LjUgODMuMzMgMTkxLjY2IDI1OC4zMyAyMTIuNSAxMTYuNjcgMjAuODMgMTU0LjE3IDQ1LjgzIDE1NC4xNyAxMTIuNXMtNTguMzQgMTEyLjUtMTM3LjUgMTEyLjVjLTEwOC4zNCAwLTE0NS44NC00NS44NC0xNTguMzQtMTA4LjM0LTQuMTYtMTYuNjYtMTYuNjYtMjUtMjkuMTYtMjVoLTcwLjg0Yy0xNi42NiAwLTI5LjE2IDEyLjUtMjkuMTYgMjkuMTd2NC4xN2MxNi42NiAxMDQuMTYgODMuMzMgMTc5LjE2IDIyMC44MyAyMDB2MTAwYzAgMTYuNjYgMTIuNSAyOS4xNiAzMy4zMyAzMy4zM2g2Mi41YzE2LjY3IDAgMjkuMTctMTIuNSAzMy4zNC0zMy4zM3YtMTAwYzEyNS0yMC44NCAyMDguMzMtMTA4LjM0IDIwOC4zMy0yMjAuODR6IiBmaWxsPSIjZmZmIi8+CiAgPHBhdGggZD0iTTc4Ny41IDE1OTUuODNjLTMyNS0xMTYuNjYtNDkxLjY3LTQ3OS4xNi0zNzAuODMtODAwIDYyLjUtMTc1IDIwMC0zMDguMzMgMzcwLjgzLTM3MC44MyAxNi42Ny04LjMzIDI1LTIwLjgzIDI1LTQxLjY3VjMyNWMwLTE2LjY3LTguMzMtMjkuMTctMjUtMzMuMzMtNC4xNyAwLTEyLjUgMC0xNi42NyA0LjE2LTM5NS44MyAxMjUtNjEyLjUgNTQ1Ljg0LTQ4Ny41IDk0MS42NyA3NSAyMzMuMzMgMjU0LjE3IDQxMi41IDQ4Ny41IDQ4Ny41IDE2LjY3IDguMzMgMzMuMzQgMCAzNy41LTE2LjY3IDQuMTctNC4xNiA0LjE3LTguMzMgNC4xNy0xNi42NnYtNTguMzRjMC0xMi41LTEyLjUtMjkuMTYtMjUtMzcuNXpNMTIyOS4xNyAyOTUuODNjLTE2LjY3LTguMzMtMzMuMzQgMC0zNy41IDE2LjY3LTQuMTcgNC4xNy00LjE3IDguMzMtNC4xNyAxNi42N3Y1OC4zM2MwIDE2LjY3IDEyLjUgMzMuMzMgMjUgNDEuNjcgMzI1IDExNi42NiA0OTEuNjcgNDc5LjE2IDM3MC44MyA4MDAtNjIuNSAxNzUtMjAwIDMwOC4zMy0zNzAuODMgMzcwLjgzLTE2LjY3IDguMzMtMjUgMjAuODMtMjUgNDEuNjdWMTcwMGMwIDE2LjY3IDguMzMgMjkuMTcgMjUgMzMuMzMgNC4xNyAwIDEyLjUgMCAxNi42Ny00LjE2IDM5NS44My0xMjUgNjEyLjUtNTQ1Ljg0IDQ4Ny41LTk0MS42Ny03NS0yMzcuNS0yNTguMzQtNDE2LjY3LTQ4Ny41LTQ5MS42N3oiIGZpbGw9IiNmZmYiLz4KPC9zdmc+",
  USDT: "data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMzkuNDMgMjk1LjI3Ij48dGl0bGU+dGV0aGVyLXVzZHQtbG9nbzwvdGl0bGU+PHBhdGggZD0iTTYyLjE1LDEuNDVsLTYxLjg5LDEzMGEyLjUyLDIuNTIsMCwwLDAsLjU0LDIuOTRMMTY3Ljk1LDI5NC41NmEyLjU1LDIuNTUsMCwwLDAsMy41MywwTDMzOC42MywxMzQuNGEyLjUyLDIuNTIsMCwwLDAsLjU0LTIuOTRsLTYxLjg5LTEzMEEyLjUsMi41LDAsMCwwLDI3NSwwSDY0LjQ1YTIuNSwyLjUsMCwwLDAtMi4zLDEuNDVoMFoiIHN0eWxlPSJmaWxsOiM1MGFmOTU7ZmlsbC1ydWxlOmV2ZW5vZGQiLz48cGF0aCBkPSJNMTkxLjE5LDE0NC44djBjLTEuMi4wOS03LjQsMC40Ni0yMS4yMywwLjQ2LTExLDAtMTguODEtLjMzLTIxLjU1LTAuNDZ2MGMtNDIuNTEtMS44Ny03NC4yNC05LjI3LTc0LjI0LTE4LjEzczMxLjczLTE2LjI1LDc0LjI0LTE4LjE1djI4LjkxYzIuNzgsMC4yLDEwLjc0LjY3LDIxLjc0LDAuNjcsMTMuMiwwLDE5LjgxLS41NSwyMS0wLjY2di0yOC45YzQyLjQyLDEuODksNzQuMDgsOS4yOSw3NC4wOCwxOC4xM3MtMzEuNjUsMTYuMjQtNzQuMDgsMTguMTJoMFptMC0zOS4yNVY3OS42OGg1OS4yVjQwLjIzSDg5LjIxVjc5LjY4SDE0OC40djI1Ljg2Yy00OC4xMSwyLjIxLTg0LjI5LDExLjc0LTg0LjI5LDIzLjE2czM2LjE4LDIwLjk0LDg0LjI5LDIzLjE2djgyLjloNDIuNzhWMTUxLjgzYzQ4LTIuMjEsODQuMTItMTEuNzMsODQuMTItMjMuMTRzLTM2LjA5LTIwLjkzLTg0LjEyLTIzLjE1aDBabTAsMGgwWiIgc3R5bGU9ImZpbGw6I2ZmZjtmaWxsLXJ1bGU6ZXZlbm9kZCIvPjwvc3ZnPg==",
  DAI: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnNwYWNlPSJwcmVzZXJ2ZSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmVyc2lvbj0iMS4xIiBzaGFwZS1yZW5kZXJpbmc9Imdlb21ldHJpY1ByZWNpc2lvbiIgdGV4dC1yZW5kZXJpbmc9Imdlb21ldHJpY1ByZWNpc2lvbiIgaW1hZ2UtcmVuZGVyaW5nPSJvcHRpbWl6ZVF1YWxpdHkiIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIgp2aWV3Qm94PSIwIDAgNDQ0LjQ0IDQ0NC40NCIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbG5zOnhvZG09Imh0dHA6Ly93d3cuY29yZWwuY29tL2NvcmVsZHJhdy9vZG0vMjAwMyI+CiA8ZyBpZD0iTGF5ZXJfeDAwMjBfMSI+CiAgPG1ldGFkYXRhIGlkPSJDb3JlbENvcnBJRF8wQ29yZWwtTGF5ZXIiLz4KICA8cGF0aCBmaWxsPSIjRjVBQzM3IiBmaWxsLXJ1bGU9Im5vbnplcm8iIGQ9Ik0yMjIuMjIgMGMxMjIuNzQsMCAyMjIuMjIsOTkuNSAyMjIuMjIsMjIyLjIyIDAsMTIyLjc0IC05OS40OCwyMjIuMjIgLTIyMi4yMiwyMjIuMjIgLTEyMi43MiwwIC0yMjIuMjIsLTk5LjQ5IC0yMjIuMjIsLTIyMi4yMiAwLC0xMjIuNzIgOTkuNSwtMjIyLjIyIDIyMi4yMiwtMjIyLjIyeiIvPgogIDxwYXRoIGZpbGw9IiNGRUZFRkQiIGZpbGwtcnVsZT0ibm9uemVybyIgZD0iTTIzMC40MSAyMzcuOTFsODQuNDQgMGMxLjgsMCAyLjY1LDAgMi43OCwtMi4zNiAwLjY5LC04LjU5IDAuNjksLTE3LjIzIDAsLTI1LjgzIDAsLTEuNjcgLTAuODMsLTIuMzYgLTIuNjQsLTIuMzZsLTE2OC4wNSAwYy0yLjA4LDAgLTIuNjQsMC42OSAtMi42NCwyLjY0bDAgMjQuNzJjMCwzLjE5IDAsMy4xOSAzLjMzLDMuMTlsODIuNzggMHptNzcuNzkgLTU5LjQ0YzAuMjQsLTAuNjMgMC4yNCwtMS4zMiAwLC0xLjk0IC0xLjQxLC0zLjA3IC0zLjA4LC02IC01LjAyLC04Ljc1IC0yLjkyLC00LjcgLTYuMzYsLTkuMDMgLTEwLjI4LC0xMi45MiAtMS44NSwtMi4zNSAtMy45OSwtNC40NiAtNi4zOSwtNi4yNSAtMTIuMDIsLTEwLjIzIC0yNi4zMSwtMTcuNDcgLTQxLjY3LC0yMS4xMSAtNy43NSwtMS43NCAtMTUuNjcsLTIuNTcgLTIzLjYxLC0yLjVsLTc0LjU4IDBjLTIuMDgsMCAtMi4zNiwwLjgzIC0yLjM2LDIuNjRsMCA0OS4zYzAsMi4wOCAwLDIuNjQgMi42NCwyLjY0bDE2MC4yNyAwYzAsMCAxLjM5LC0wLjI4IDEuNjcsLTEuMTFsLTAuNjggMHptMCA4OC4zM2MtMi4zNiwtMC4yNiAtNC43NCwtMC4yNiAtNy4xLDBsLTE1NC4wMiAwYy0yLjA4LDAgLTIuNzgsMCAtMi43OCwyLjc4bDAgNDguMmMwLDIuMjIgMCwyLjc4IDIuNzgsMi43OGw3MS4xMSAwYzMuNCwwLjI2IDYuOCwwLjAyIDEwLjEzLC0wLjY5IDEwLjMyLC0wLjc0IDIwLjQ3LC0yLjk4IDMwLjE1LC02LjY3IDMuNTIsLTEuMjIgNi45MiwtMi44MSAxMC4xMywtNC43MmwwLjk3IDBjMTYuNjcsLTguNjcgMzAuMjEsLTIyLjI5IDM4Ljc1LC0zOS4wMSAwLDAgMC45NywtMi4xIC0wLjEyLC0yLjY1em0tMTkxLjgxIDc4Ljc1bDAgLTAuODMgMCAtMzIuMzYgMCAtMTAuOTcgMCAtMzIuNjRjMCwtMS44MSAwLC0yLjA4IC0yLjIyLC0yLjA4bC0zMC4xNCAwYy0xLjY3LDAgLTIuMzYsMCAtMi4zNiwtMi4yMmwwIC0yNi4zOSAzMi4yMiAwYzEuOCwwIDIuNSwwIDIuNSwtMi4zNmwwIC0yNi4xMWMwLC0xLjY3IDAsLTIuMDggLTIuMjIsLTIuMDhsLTMwLjE0IDBjLTEuNjcsMCAtMi4zNiwwIC0yLjM2LC0yLjIybDAgLTI0LjQ0YzAsLTEuNTMgMCwtMS45NCAyLjIyLC0xLjk0bDI5Ljg2IDBjMi4wOCwwIDIuNjQsMCAyLjY0LC0yLjY0bDAgLTc0Ljg2YzAsLTIuMjIgMCwtMi43OCAyLjc4LC0yLjc4bDEwNC4xNiAwYzcuNTYsMC4zIDE1LjA3LDEuMTMgMjIuNSwyLjUgMTUuMzEsMi44MyAzMC4wMiw4LjMgNDMuNDcsMTYuMTEgOC45Miw1LjI1IDE3LjEzLDExLjU5IDI0LjQ0LDE4Ljg5IDUuNSw1LjcxIDEwLjQ2LDExLjg5IDE0Ljg2LDE4LjQ3IDQuMzcsNi42NyA4LDEzLjggMTAuODUsMjEuMjUgMC4zNSwxLjk0IDIuMjEsMy4yNSA0LjE1LDIuOTJsMjQuODYgMGMzLjE5LDAgMy4xOSwwIDMuMzMsMy4wNmwwIDIyLjc4YzAsMi4yMiAtMC44MywyLjc4IC0zLjA2LDIuNzhsLTE5LjE3IDBjLTEuOTQsMCAtMi41LDAgLTIuMzYsMi41IDAuNzYsOC40NiAwLjc2LDE2Ljk1IDAsMjUuNDEgMCwyLjM2IDAsMi42NCAyLjY1LDIuNjRsMjEuOTMgMGMwLjk3LDEuMjUgMCwyLjUgMCwzLjc2IDAuMTQsMS42MSAwLjE0LDMuMjQgMCw0Ljg1bDAgMTYuODFjMCwyLjM2IC0wLjY5LDMuMDYgLTIuNzgsMy4wNmwtMjYuMjUgMGMtMS44MywtMC4zNSAtMy42MSwwLjgyIC00LjAzLDIuNjQgLTYuMjUsMTYuMjUgLTE2LjI1LDMwLjgyIC0yOS4xNyw0Mi41IC00LjcyLDQuMjUgLTkuNjgsOC4yNSAtMTQuODYsMTEuOTQgLTUuNTYsMy4yIC0xMC45Nyw2LjUzIC0xNi42Nyw5LjE3IC0xMC40OSw0LjcyIC0yMS40OSw4LjIgLTMyLjc4LDEwLjQxIC0xMC43MiwxLjkyIC0yMS41OSwyLjc5IC0zMi41LDIuNjRsLTk2LjM5IDAgMCAtMC4xNHoiLz4KIDwvZz4KPC9zdmc+",
  PYUSD:
    "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgODQuMyA4NC45IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA4NC4zIDg0Ljk7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojMDA3MUYzO30KCS5zdDF7ZmlsbDojRkZGRkZGO30KPC9zdHlsZT4KPHA+PHBhdGggY2xhc3M9InN0MCIgZD0iTTQyLjEsODQuOWMyMy4zLDAsNDIuMS0xOSw0Mi4xLTQyLjRDNjQuMywxOSw2NS40LDAsNDIuMSwwQzE4LjksMCwwLDE5LDAsNDIuNEMwLDY1LjksMTguOSw4NC45LDQyLjEsODQuOXoiLz4KPHBhdGggY2xhc3M9InN0MSIgZD0iTTQ4LjgsMTdoLTQuNkgzNGMtMS42LDAtMy4xLDEuMi0zLjMsMi45bC0xLDYuOHYwLjFoLTVjLTEuMywwLTIuNCwxLjEtMi40LDIuNGMwLDEuNCwxLjEsMi40LDIuNCwyLjVoNC4yCglsLTAuNyw0LjdsMCwwLjRoLTVjLTEuMywwLTIuNCwxLjEtMi40LDIuNGMwLDEuMywxLjEsMi40LDIuNCwyLjRoNC4ybC0yLjMsMTQuNmwtMC43LDQuOWwtMC40LDIuNmMtMC4zLDIuMSwxLjIsMy45LDMuMywzLjloMy4yCgloNC40aDMuNmMxLjYsMCwzLTEuMiwzLjMtMi45bDIuMS0xMy40aDEuMmg0YzkuNCwwLDE3LjEtNy44LDE2LjktMTcuM0M2NS45LDI0LjMsNTguMSwxNyw0OC44LDE3eiBNMzMuOCwzMS41bDE1LDAuMQoJYzEuMywwLDIuNSwxLjEsMi41LDIuNWMwLDEuNC0xLjEsMi41LTIuNSwyLjVIMzNMMzMuOCwzMS41eiBNNDguOSw0Ni4xaC0yLjVoLTEuMmgtMi41Yy0xLjYsMC0zLDEuMi0zLjMsMi45bC0yLjEsMTMuNEgyOWwzLjItMjEKCWgxNi42YzQsMCw3LjMtMy4zLDcuMy03LjNjMC00LTMuMy03LjMtNy4zLTcuM2wtMTQuMi0wLjFsMC43LTQuOGgxMy44YzYuOCwwLDEyLjIsNS42LDEyLjEsMTIuNEM2MSw0MC45LDU1LjUsNDYuMSw0OC45LDQ2LjF6Ii8+Cjwvc3ZnPgo=",
};

export const TOKEN_ADDRESSES: Record<
  number,
  Partial<Record<Stablecoin, string>>
> = {
  // Ethereum Mainnet (Chain ID: 1)
  1: {
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    PYUSD: "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8",
  },

  // Base (Chain ID: 8453)
  8453: {
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Native USDC on Base
    // Base primarily uses native USDC; bridged versions available but not recommended
  },

  // Arbitrum One (Chain ID: 42161)
  42161: {
    USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Native USDC on Arbitrum
    USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
  },

  // Optimism (Chain ID: 10)
  10: {
    USDC: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // Native USDC on Optimism
    USDT: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
    DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
  },

  // Polygon (Chain ID: 137)
  137: {
    USDC: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // Native USDC on Polygon (USDC.e for bridged)
    USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  },
};

/**
 * Token decimals (for amount calculations)
 */
export const TOKEN_DECIMALS: Record<Stablecoin, number> = {
  USDC: 6,
  USDT: 6,
  DAI: 18,
  PYUSD: 6,
};

/**
 * Token display information
 */
export interface TokenInfo {
  symbol: Stablecoin;
  name: string;
  decimals: number;
  logo?: string;
}

export const TOKEN_INFO: Record<Stablecoin, TokenInfo> = {
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logo: TOKEN_SVGS.USDC,
  },
  USDT: {
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    logo: TOKEN_SVGS.USDT,
  },
  DAI: {
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    logo: TOKEN_SVGS.DAI,
  },
  PYUSD: {
    symbol: "PYUSD",
    name: "PayPal USD",
    decimals: 6,
    logo: TOKEN_SVGS.PYUSD,
  },
};

/**
 * Chain information
 */
export interface ChainInfo {
  id: number;
  name: string; // Uppercase chain name matching backend enum (ETHEREUM, BASE, ARBITRUM, OPTIMISM, POLYGON, BSV)
  nativeCurrency: string;
  gasLevel: "low" | "medium" | "high";
}

export const CHAIN_INFO: Record<number, ChainInfo> = {
  1: {
    id: 1,
    name: "ETHEREUM",
    nativeCurrency: "ETH",
    gasLevel: "high",
  },
  8453: {
    id: 8453,
    name: "BASE",
    nativeCurrency: "ETH",
    gasLevel: "low",
  },
  42161: {
    id: 42161,
    name: "ARBITRUM",
    nativeCurrency: "ETH",
    gasLevel: "medium",
  },
  10: {
    id: 10,
    name: "OPTIMISM",
    nativeCurrency: "ETH",
    gasLevel: "medium",
  },
  137: {
    id: 137,
    name: "POLYGON",
    nativeCurrency: "MATIC",
    gasLevel: "low",
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get token contract address for a specific chain
 */
export function getTokenAddress(
  chainId: number,
  token: Stablecoin
): string | undefined {
  return TOKEN_ADDRESSES[chainId]?.[token];
}

/**
 * Get all available tokens for a specific chain
 */
export function getAvailableTokens(chainId: number): Stablecoin[] {
  const tokens = TOKEN_ADDRESSES[chainId];
  if (!tokens) return [];
  return Object.keys(tokens) as Stablecoin[];
}

/**
 * Check if a token is supported on a specific chain
 */
export function isTokenSupported(chainId: number, token: Stablecoin): boolean {
  return !!TOKEN_ADDRESSES[chainId]?.[token];
}

/**
 * Get all chains that support a specific token
 */
export function getChainsForToken(token: Stablecoin): number[] {
  return (
    Object.entries(TOKEN_ADDRESSES)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, tokens]) => !!tokens[token])
      .map(([chainId]) => parseInt(chainId))
  );
}

/**
 * Get token decimals
 */
export function getTokenDecimals(token: Stablecoin): number {
  return TOKEN_DECIMALS[token] || 18;
}

/**
 * Format amount with correct decimals for token
 * @param amount - Amount in token's base units (e.g., 1000000 for 1 USDC)
 * @param token - Token symbol
 * @returns Formatted string (e.g., "1.00")
 */
export function formatTokenAmount(amount: bigint, token: Stablecoin): string {
  const decimals = getTokenDecimals(token);
  const divisor = BigInt(10 ** decimals);
  const wholePart = amount / divisor;
  const fractionalPart = amount % divisor;

  // Pad fractional part with leading zeros
  const fractionalStr = fractionalPart.toString().padStart(decimals, "0");

  // Trim trailing zeros for display
  const trimmedFractional = fractionalStr.replace(/0+$/, "");

  if (trimmedFractional === "") {
    return wholePart.toString();
  }

  return `${wholePart}.${trimmedFractional}`;
}

/**
 * Parse amount string to bigint with correct decimals for token
 * @param amount - Amount as string (e.g., "1.5")
 * @param token - Token symbol
 * @returns Amount in token's base units (e.g., 1500000 for 1.5 USDC)
 */
export function parseTokenAmount(amount: string, token: Stablecoin): bigint {
  const decimals = getTokenDecimals(token);
  const [whole, fractional = ""] = amount.split(".");

  // Pad or trim fractional part to match decimals
  const paddedFractional = fractional.padEnd(decimals, "0").slice(0, decimals);

  // Combine whole and fractional parts
  const fullAmount = whole + paddedFractional;

  return BigInt(fullAmount);
}

/**
 * Get recommended chain for a token based on gas costs
 * Returns chains sorted by gas level (lowest first)
 */
export function getRecommendedChains(token: Stablecoin): ChainInfo[] {
  const supportedChainIds = getChainsForToken(token);
  const chains = supportedChainIds.map((id) => CHAIN_INFO[id]).filter(Boolean);

  // Sort by gas level: low → medium → high
  return chains.sort((a, b) => {
    const gasOrder = { low: 0, medium: 1, high: 2 };
    return gasOrder[a.gasLevel] - gasOrder[b.gasLevel];
  });
}

/**
 * Standard ERC-20 ABI (minimal - just what we need for transfers)
 */
export const ERC20_ABI = [
  {
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
