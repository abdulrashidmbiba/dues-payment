import { Medal, Star, Rocket, CheckCircle2 } from "lucide-react";

/**
 * Badges are computed live from the member's actual payment history —
 * nothing here is hardcoded. Each badge has a concrete, checkable rule:
 *  - Early Bird: paid a dues category at least 3 days before its due date
 *  - Consistent Contributor: 2 or more successful payments
 *  - Gold Supporter: GHS 100+ paid in total
 *  - Fully Paid Up: current dues balance is fully settled
 */
export function computeBadges(payments, status) {
  const successPayments = payments.filter((p) => p.status === "success");

  const earlyBird = successPayments.some((p) => {
    if (!p.dues_categories?.due_date) return false;
    const daysEarly = (new Date(p.dues_categories.due_date) - new Date(p.paid_at)) / (1000 * 60 * 60 * 24);
    return daysEarly >= 3;
  });

  const consistent = successPayments.length >= 2;
  const goldSupporter = (status?.totalPaid ?? 0) >= 100;
  const fullyPaid = !!status?.isPaid;

  return [
    {
      label: "EARLY BIRD",
      icon: Medal,
      unlocked: earlyBird,
      description: "Pay a dues category at least 3 days before its due date.",
    },
    {
      label: "CONSISTENT",
      icon: Star,
      unlocked: consistent,
      description: "Make 2 or more successful payments.",
    },
    {
      label: "GOLD SUPPORTER",
      icon: Rocket,
      unlocked: goldSupporter,
      description: "Contribute GHS 100 or more in total.",
    },
    {
      label: "FULLY PAID UP",
      icon: CheckCircle2,
      unlocked: fullyPaid,
      description: "Fully settle your current dues balance.",
    },
  ];
}