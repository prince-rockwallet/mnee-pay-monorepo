import { ButtonConfigOverride, StyleConfig, Theme } from "@mnee-pay/checkout";

export interface ButtonConfig extends ButtonConfigOverride, StyleConfig {
    showConfetti?: boolean;
    theme?: Theme;
}