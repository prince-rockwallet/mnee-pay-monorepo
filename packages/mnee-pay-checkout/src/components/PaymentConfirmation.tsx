import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Check,
  Copy,
} from "lucide-react";
import {
  useAccount,
  useSwitchChain,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { Button } from "./ui/button";
import {
  PaymentResult,
  StyleConfig,
  Stablecoin,
  CheckoutType,
} from "../types";
import { useCheckout } from "../contexts/CheckoutContext";
import confetti from "canvas-confetti";
import { formatCurrency } from "../lib/currency";
import { TokenSelector } from "./TokenSelector";
import { ERC20_ABI, CHAIN_INFO } from "../lib/tokens";
import {
  parsePaymentAmount,
  estimateGasCost,
  parsePaymentError,
  getExplorerUrl,
  formatTransactionHash,
} from "../lib/payment";
import { completeSession, getTransactionStatus, getChainName } from "../lib/api";

interface PaymentConfirmationProps {
  onSuccess: (result: PaymentResult) => Promise<void> | void;
  onError: (error: Error) => void;
  showConfetti?: boolean;
  styling?: StyleConfig;
  onComplete?: () => void;

  // Session creation params
  apiBaseUrl: string;
  buttonId?: string;
  amountUsdCents: number;
  checkoutType: CheckoutType;
  customerEmail?: string;
  customerPhone?: string;
  selectedOptions?: Record<string, string>;
  shippingAddress?: any;
  cartItems?: any[];
  subtotalCents?: number;
  taxCents?: number;
  shippingCents?: number;
  quantity?: number;

  // Legacy cart checkout props (for CartCheckoutModal)
  merchantId?: string;
  sessionMetadata?: any;
  isCartCheckout?: boolean;
  metadata?: any;
  displayMode?: 'modal' | 'drawer';
  calculateTotalsUrl?: string;
}

export function PaymentConfirmation({
  onSuccess,
  onError,
  showConfetti = false,
  styling,
  onComplete,
  apiBaseUrl,
  buttonId,
  amountUsdCents,
  // checkoutType,
  customerEmail,
  customerPhone,
  selectedOptions,
  shippingAddress,
  cartItems,
  subtotalCents,
  taxCents,
  shippingCents,
  quantity,
  // Legacy cart checkout props (unused in hosted button flow, but accepted for compatibility)
  merchantId: _merchantId,
  sessionMetadata: _sessionMetadata,
  isCartCheckout: _isCartCheckout,
  metadata: _metadata,
  displayMode: _displayMode,
  calculateTotalsUrl: _calculateTotalsUrl,
}: PaymentConfirmationProps) {
  const {
    walletAddress,
    walletProvider,
    step,
    setStep,
    setPaymentResult,
    createSession,
    session,
  } = useCheckout();

  const { address: userAddress, chainId: currentChainId } = useAccount();
  const { switchChain } = useSwitchChain();

  // Token selection state
  const [selectedToken, setSelectedToken] = useState<Stablecoin | undefined>();
  const [selectedChainId, setSelectedChainId] = useState<number | undefined>();
  const [selectedTokenAddress, setSelectedTokenAddress] = useState<string | undefined>();
  const [showTokenSelector, setShowTokenSelector] = useState(walletProvider !== "yours");

  // Transaction state
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [copied, setCopied] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isPreparingPayment, setIsPreparingPayment] = useState(false);

  // Confirmation progress state
  const [confirmationProgress, setConfirmationProgress] = useState<{
    confirmations: number;
    requiredConfirmations: number;
    progress: string;
    percentComplete: number;
  } | null>(null);

  // Track processed transactions to prevent duplicate callbacks
  const processedTxHashes = useRef<Set<string>>(new Set());

  // Wagmi hooks for contract interaction
  const {
    writeContract,
    data: hash,
    error: writeError,
    isPending,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  // Final amount to display/charge
  const finalAmount = session?.mneeAmount ?? amountUsdCents / 100;

  // Auto-create session for Yours wallet (BSV/MNEE direct payment)
  useEffect(() => {
    if (
      walletProvider === "yours" &&
      !session &&
      walletAddress &&
      step === "confirming" &&
      !isCreatingSession
    ) {
      setIsCreatingSession(true);

      (async () => {
        try {
          await createSession(
            apiBaseUrl,
            buttonId!, // buttonId is always provided by MneeCheckout
            amountUsdCents,
            "BSV",
            "MNEE",
            customerEmail,
            selectedOptions,
            customerPhone,
            shippingAddress,
            cartItems,
            subtotalCents,
            taxCents,
            shippingCents,
            quantity
          );
        } catch (error: any) {
          console.error("[PaymentConfirmation] Failed to create session:", error);
          setErrorMessage(error.message || "Failed to create checkout session");
          setStep("error");
          onError(error);
          setIsCreatingSession(false);
        }
      })();
    }
  }, [walletProvider, session, walletAddress, step, isCreatingSession, createSession, apiBaseUrl, buttonId, amountUsdCents, customerEmail, customerPhone, selectedOptions, shippingAddress, cartItems, subtotalCents, taxCents, shippingCents, quantity, setStep, onError]);

  // Handle token selection
  const handleTokenSelect = (
    token: Stablecoin,
    chainId: number,
    tokenAddress: string
  ) => {
    setSelectedToken(token);
    setSelectedChainId(chainId);
    setSelectedTokenAddress(tokenAddress);
  };

  // Handle proceeding to payment after token selection (EVM)
  const handleProceedToPayment = async () => {
    if (!selectedToken || !selectedChainId || !selectedTokenAddress) {
      setErrorMessage("Please select a payment token");
      return;
    }

    try {
      setIsPreparingPayment(true);

      const chainName = getChainName(selectedChainId);

      await createSession(
        apiBaseUrl,
        buttonId!, // buttonId is always provided by MneeCheckout
        amountUsdCents,
        chainName,
        selectedToken,
        customerEmail,
        selectedOptions,
        customerPhone,
        shippingAddress,
        cartItems,
        subtotalCents,
        taxCents,
        shippingCents,
        quantity
      );

      setShowTokenSelector(false);
      setIsPreparingPayment(false);
      setStep("confirming");
    } catch (error: any) {
      console.error("Payment preparation failed:", error);
      setErrorMessage(error.message || "Failed to prepare payment");
      setIsPreparingPayment(false);
      setStep("error");
      onError(error);
    }
  };

  // Handle actual payment
  const handlePayment = async () => {
    if (!walletAddress && !userAddress) {
      onError(new Error("No wallet connected"));
      return;
    }

    if (!session) {
      onError(new Error("No active checkout session"));
      return;
    }

    setIsProcessing(true);
    setStep("processing");
    setErrorMessage(undefined);

    try {
      // Yours Wallet: Direct MNEE transfer
      if (walletProvider === "yours") {
        if (typeof window === 'undefined') {
          return;
        }
        const wallet = (window as any).yours;
        if (!wallet) {
          throw new Error("Yours Wallet not found");
        }

        const transferParams = [{
          address: session.mneeDepositAddress,
          amount: finalAmount,
        }];

        const { txid } = await wallet.sendMNEE(transferParams);

        if (!txid) {
          // User cancelled
          setStep("confirming");
          setIsProcessing(false);
          return;
        }

        // Complete the session
        await completeSession(apiBaseUrl, session.sessionToken, txid);

        const result: PaymentResult = {
          transactionHash: txid,
          amount: finalAmount.toFixed(2),
          currency: "MNEE",
          from: walletAddress!,
          to: session.mneeDepositAddress,
          timestamp: Date.now(),
          networkId: 0,
          metadata: { sessionId: session.sessionId },
        };

        setPaymentResult(result);
        setTxHash(txid);

        if (!processedTxHashes.current.has(txid)) {
          processedTxHashes.current.add(txid);
          await Promise.resolve(onSuccess(result));
        }

        // Start polling for confirmations
        pollConfirmations(txid);
        setIsProcessing(false);
        return;
      }

      // EVM Wallet: ERC-20 stablecoin transfer
      if (!userAddress) {
        onError(new Error("No wallet connected"));
        return;
      }

      if (!selectedToken || !selectedChainId || !selectedTokenAddress) {
        onError(new Error("No payment token selected"));
        return;
      }

      // Switch network if needed
      if (currentChainId !== selectedChainId) {
        await switchChain({ chainId: selectedChainId });
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Parse payment amount to token units
      const amountInTokenUnits = parsePaymentAmount(
        finalAmount.toString(),
        selectedToken
      );

      // Execute ERC-20 transfer
      writeContract({
        address: selectedTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [session.depositAddress as `0x${string}`, amountInTokenUnits],
        chainId: selectedChainId,
      });
    } catch (error: any) {
      console.error("Payment error:", error);
      const errorMsg = parsePaymentError(error);

      const isUserRejection =
        errorMsg.includes("cancelled") ||
        errorMsg.includes("rejected") ||
        errorMsg.includes("denied");

      if (isUserRejection) {
        setStep("confirming");
        setShowTokenSelector(walletProvider !== "yours");
        setErrorMessage(undefined);
        setIsProcessing(false);
      } else {
        setErrorMessage(errorMsg);
        setStep("error");
        onError(new Error(errorMsg));
        setIsProcessing(false);
      }
    }
  };

  // Watch for EVM transaction hash
  useEffect(() => {
    if (hash) {
      setTxHash(hash);
    }
  }, [hash]);

  // Watch for EVM write errors
  useEffect(() => {
    if (writeError && step === "processing") {
      const errorMsg = parsePaymentError(writeError);
      const isUserRejection =
        errorMsg.includes("cancelled") ||
        errorMsg.includes("rejected") ||
        errorMsg.includes("denied");

      if (isUserRejection) {
        setStep("confirming");
        setShowTokenSelector(true);
        setErrorMessage(undefined);
        setIsProcessing(false);
      } else {
        setErrorMessage(errorMsg);
        setStep("error");
        onError(writeError);
        setIsProcessing(false);
      }
    }
  }, [writeError, step, setStep, onError]);

  // Watch for EVM transaction confirmation
  useEffect(() => {
    if (!isConfirmed || !hash || !selectedToken || !selectedChainId || !session) {
      return;
    }

    if (processedTxHashes.current.has(hash)) {
      return;
    }

    (async () => {
      try {
        processedTxHashes.current.add(hash);

        // Complete the session
        await completeSession(apiBaseUrl, session.sessionToken, hash);

        const result: PaymentResult = {
          transactionHash: hash,
          amount: finalAmount.toFixed(2),
          currency: selectedToken,
          from: (userAddress || walletAddress)!,
          to: session.depositAddress,
          timestamp: Date.now(),
          networkId: selectedChainId,
          metadata: { sessionId: session.sessionId },
        };

        setPaymentResult(result);
        await Promise.resolve(onSuccess(result));

        // Start polling for confirmations
        pollConfirmations(hash);
        setIsProcessing(false);
      } catch (error: any) {
        console.error("Payment validation failed:", error);
        setErrorMessage(
          error.message || "Payment succeeded but order creation failed. Transaction ID: " + hash
        );
        setStep("error");
        onError(error);
        setIsProcessing(false);
      }
    })();
  }, [isConfirmed, hash, selectedToken, selectedChainId, session, apiBaseUrl, finalAmount, userAddress, walletAddress, setPaymentResult, onSuccess, setStep, onError]);

  // Poll for transaction confirmations
  const pollConfirmations = (txHash: string) => {
    const poll = async () => {
      try {
        const status = await getTransactionStatus(apiBaseUrl, txHash);

        if (status.found) {
          setConfirmationProgress({
            confirmations: status.confirmations || 0,
            requiredConfirmations: status.requiredConfirmations || 0,
            progress: status.progress || `${status.confirmations}/${status.requiredConfirmations}`,
            percentComplete: status.percentComplete || 0,
          });

          if (status.isConfirmed) {
            setStep("complete");
            if (showConfetti) {
              const colors = styling?.buttonColor
                ? [styling.buttonColor, styling.primaryColor || "#8b5cf6"]
                : ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b"];
              confetti({
                particleCount: 100,
                spread: 70,
                origin: { x: 0.5, y: 0.6 },
                colors,
              });
            }
            return;
          }
        }

        setTimeout(poll, 3000);
      } catch (error) {
        setTimeout(poll, 3000);
      }
    };

    poll();
  };

  // Trigger confetti when step becomes 'complete'
  useEffect(() => {
    if (step === "complete" && showConfetti && !txHash) {
      const colors = styling?.buttonColor
        ? [styling.buttonColor, styling.primaryColor || "#8b5cf6"]
        : ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b"];
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: 0.5, y: 0.6 },
        colors,
      });
    }
  }, [step, showConfetti, styling, txHash]);

  // Complete state
  if (step === "complete" && txHash) {
    const blockchainName = walletProvider === "yours"
      ? "BSV blockchain"
      : selectedChainId ? CHAIN_INFO[selectedChainId]?.name : "blockchain";

    const explorerUrl = walletProvider === "yours"
      ? `https://whatsonchain.com/tx/${txHash}`
      : selectedChainId ? getExplorerUrl(selectedChainId, txHash) : null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6 py-8"
      >
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">Payment Successful!</h3>
          <p className="text-muted-foreground">
            Your transaction has been confirmed on {blockchainName}
          </p>
        </div>

        {explorerUrl && (
          <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Transaction Hash</span>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                View on Explorer
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded bg-background border border-border">
              <code className="flex-1 text-xs font-mono text-foreground break-all">{txHash}</code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(txHash);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex-shrink-0 p-1.5 hover:bg-muted rounded transition-colors"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        )}

        <Button
          onClick={onComplete}
          className="w-full"
          size="lg"
          style={styling?.buttonColor ? { backgroundColor: styling.buttonColor } : undefined}
        >
          Done
        </Button>
      </motion.div>
    );
  }

  // Error state
  if (step === "error") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4 py-8"
      >
        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-2xl font-bold text-foreground">Payment Failed</h3>
        <p className="text-muted-foreground">
          {errorMessage || "There was an error processing your payment"}
        </p>
        <Button
          onClick={() => {
            setStep("confirming");
            setShowTokenSelector(walletProvider !== "yours");
            setErrorMessage(undefined);
          }}
        >
          Try Again
        </Button>
      </motion.div>
    );
  }

  // No wallet connected
  const isWalletConnected = walletProvider === "yours" ? walletAddress : userAddress || walletAddress;
  if (!isWalletConnected) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="mx-auto w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h3 className="text-xl font-bold">Wallet Required</h3>
        <p className="text-muted-foreground">Please connect your wallet to continue</p>
        <Button onClick={() => setStep("connecting")}>Connect Wallet</Button>
      </div>
    );
  }

  // Token selector for EVM wallets
  if (showTokenSelector && walletProvider !== "yours") {
    return (
      <div className="space-y-6">
        <TokenSelector
          amount={amountUsdCents / 100}
          selectedToken={selectedToken}
          selectedChainId={selectedChainId}
          onSelect={handleTokenSelect}
        />
        <div className="flex gap-3">
          <Button
            onClick={() => {
              // Go back to collecting step, keep wallet connected
              setStep("collecting");
            }}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            Back
          </Button>
          {selectedToken && selectedChainId && selectedTokenAddress && (
            <Button
              onClick={handleProceedToPayment}
              disabled={isPreparingPayment}
              className="flex-1"
              size="lg"
              style={styling?.buttonColor ? { backgroundColor: styling.buttonColor } : undefined}
            >
              {isPreparingPayment ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Preparing Payment...
                </>
              ) : (
                "Continue to Payment"
              )}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Loading state while creating session for Yours wallet
  if (walletProvider === "yours" && !session && isCreatingSession) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-4 py-8"
      >
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Preparing Payment...</h3>
        <p className="text-muted-foreground">Creating secure checkout session</p>
      </motion.div>
    );
  }

  // Processing state
  if (step === "processing") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-4 py-8"
      >
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
        <h3 className="text-xl font-bold text-foreground">
          {isConfirming ? "Confirming Transaction..." : "Processing Payment..."}
        </h3>
        <p className="text-muted-foreground">
          {isConfirming ? "Waiting for blockchain confirmation" : "Please wait..."}
        </p>

        {confirmationProgress && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Confirmations</span>
              <span className="font-mono font-semibold text-foreground">
                {confirmationProgress.progress}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${confirmationProgress.percentComplete}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {txHash && (
          <p className="text-xs text-muted-foreground font-mono">
            {formatTransactionHash(txHash)}
          </p>
        )}
      </motion.div>
    );
  }

  // Payment confirmation screen
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-foreground">Confirm Payment</h3>
        <p className="text-muted-foreground">Review the details below before confirming</p>
      </div>

      <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
        {/* Cart items breakdown */}
        {cartItems && cartItems.length > 0 ? (
          <>
            <h4 className="font-semibold text-sm mb-2 text-foreground">
              Order Items ({cartItems.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {cartItems.map((item, index) => (
                <div
                  key={item.buttonId || index}
                  className="flex justify-between text-sm border-b border-border pb-2 last:border-0"
                >
                  <div className="flex-1">
                    <div className="font-medium text-foreground">
                      {item.productName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Qty: {item.quantity} × {formatCurrency((item.baseAmountCents || 0) / 100, "USD")}
                    </div>
                    {item.optionsTotalCents > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Options: +{formatCurrency(item.optionsTotalCents / 100, "USD")}
                      </div>
                    )}
                  </div>
                  <div className="font-semibold text-foreground">
                    {formatCurrency(
                      ((item.baseAmountCents || 0) + (item.optionsTotalCents || 0)) * item.quantity / 100,
                      "USD"
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Order totals breakdown */}
            <div className="border-t border-border pt-2 space-y-1">
              {subtotalCents !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatCurrency(subtotalCents / 100, "USD")}</span>
                </div>
              )}
              {shippingCents !== undefined && shippingCents > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">{formatCurrency(shippingCents / 100, "USD")}</span>
                </div>
              )}
              {taxCents !== undefined && taxCents > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground">{formatCurrency(taxCents / 100, "USD")}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold pt-1 border-t border-border">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">{formatCurrency(finalAmount, "USD")}</span>
              </div>
            </div>
          </>
        ) : (
          /* Simple amount display for single-item or non-cart checkouts */
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-semibold text-foreground">
              {formatCurrency(finalAmount, "USD")}
            </span>
          </div>
        )}

        <div className="border-t border-border pt-2 space-y-2">
          {walletProvider === "yours" ? (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paying with</span>
                <span className="font-semibold text-foreground">MNEE</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">To</span>
                <span className="font-mono text-sm text-foreground">
                  {session?.mneeDepositAddress
                    ? `${session.mneeDepositAddress.slice(0, 6)}...${session.mneeDepositAddress.slice(-4)}`
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">From</span>
                <span className="font-mono text-sm text-foreground">
                  {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paying with</span>
                <span className="font-semibold text-foreground">
                  {selectedToken} on {CHAIN_INFO[selectedChainId!]?.name || `Chain ${selectedChainId}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated gas</span>
                <span className="text-foreground">~${estimateGasCost(selectedChainId!).estimatedCostUSD}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">To</span>
                <span className="font-mono text-sm text-foreground">
                  {session?.depositAddress
                    ? `${session.depositAddress.slice(0, 6)}...${session.depositAddress.slice(-4)}`
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">From</span>
                <span className="font-mono text-sm text-foreground">
                  {(userAddress || walletAddress)?.slice(0, 6)}...{(userAddress || walletAddress)?.slice(-4)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {walletProvider !== "yours" && currentChainId !== selectedChainId && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900 p-3 text-sm">
          <p className="text-yellow-900 dark:text-yellow-200">
            ⚠️ You'll be prompted to switch to {CHAIN_INFO[selectedChainId!]?.name} before confirming
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          onClick={() => {
            if (walletProvider === "yours") {
              // Go back to collecting step, keep wallet connected
              setStep("collecting");
            } else {
              setShowTokenSelector(true);
              setErrorMessage(undefined);
            }
          }}
          variant="outline"
          className="flex-1"
          size="lg"
          disabled={isProcessing || isPending}
        >
          Back
        </Button>
        <Button
          onClick={handlePayment}
          disabled={isProcessing || isPending || !session}
          className="flex-1"
          size="lg"
          style={styling?.buttonColor ? { backgroundColor: styling.buttonColor } : undefined}
        >
          {isProcessing || isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Confirm & Pay"
          )}
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        You will be prompted to sign this transaction in your wallet
      </p>
    </div>
  );
}
