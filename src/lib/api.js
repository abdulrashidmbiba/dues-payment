import { supabase } from './supabaseClient';

/* ---------------------------------------------------------- */
/* MEMBER DASHBOARD                                            */
/* ---------------------------------------------------------- */

export async function getDuesCategories() {
  const { data, error } = await supabase
    .from('dues_categories')
    .select('*')
    .eq('active', true)
    .order('due_date', { ascending: true });
  if (error) throw error;
  return data;
}

/**
 * Returns payment status summary for the logged-in member:
 * total paid, total owed (based on active dues categories), % paid,
 * next due date, and whether they're fully paid up.
 */
export async function getMemberPaymentStatus(memberId) {
  const [{ data: categories, error: catErr }, { data: payments, error: payErr }] =
    await Promise.all([
      supabase.from('dues_categories').select('*').eq('active', true),
      supabase
        .from('payments')
        .select('*')
        .eq('member_id', memberId)
        .eq('status', 'success'),
    ]);

  if (catErr) throw catErr;
  if (payErr) throw payErr;

  const totalDue = categories.reduce((sum, c) => sum + Number(c.amount), 0);
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const percentPaid = totalDue > 0 ? Math.min(100, Math.round((totalPaid / totalDue) * 100)) : 0;

  const upcoming = categories
    .filter((c) => c.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];

  const daysUntilDue = upcoming
    ? Math.ceil((new Date(upcoming.due_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return {
    totalDue,
    totalPaid,
    percentPaid,
    isPaid: percentPaid >= 100,
    nextDueDate: upcoming?.due_date ?? null,
    daysUntilDue,
  };
}

export async function getPaymentHistory(memberId) {
  const { data, error } = await supabase
    .from('payments')
    .select('*, dues_categories(name)')
    .eq('member_id', memberId)
    .order('paid_at', { ascending: false });
  if (error) throw error;
  return data;
}

/* ---------------------------------------------------------- */
/* COMMUNITY IMPACT BOARD                                      */
/* ---------------------------------------------------------- */

export async function getCommunityProjects() {
  const { data, error } = await supabase
    .from('community_projects')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map((p) => ({
    ...p,
    percentFunded: p.target_amount > 0
      ? Math.min(100, Math.round((p.raised_amount / p.target_amount) * 100))
      : 0,
  }));
}

/* ---------------------------------------------------------- */
/* TREASURER DASHBOARD                                         */
/* ---------------------------------------------------------- */

export async function getTreasurerStats() {
  const [{ data: payments, error: payErr }, { count: totalMembers, error: memErr }] =
    await Promise.all([
      supabase.from('payments').select('amount, status, paid_at').eq('status', 'success'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'member'),
    ]);

  if (payErr) throw payErr;
  if (memErr) throw memErr;

  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  // distinct members who have paid
  const { data: paidMemberIds, error: paidErr } = await supabase
    .from('payments')
    .select('member_id')
    .eq('status', 'success');
  if (paidErr) throw paidErr;

  const uniquePaid = new Set(paidMemberIds.map((p) => p.member_id)).size;

  // monthly breakdown
  const monthly = {};
  payments.forEach((p) => {
    const month = new Date(p.paid_at).toLocaleString('default', { month: 'short', year: 'numeric' });
    monthly[month] = (monthly[month] || 0) + Number(p.amount);
  });

  return {
    totalCollected,
    membersPaid: uniquePaid,
    membersUnpaid: Math.max(0, (totalMembers ?? 0) - uniquePaid),
    monthlyBreakdown: Object.entries(monthly).map(([month, amount]) => ({ month, amount })),
  };
}

/* ---------------------------------------------------------- */
/* ADMIN                                                        */
/* ---------------------------------------------------------- */

export async function getAllMembers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function removeMember(profileId) {
  // Deletes the profile row. The linked auth.users row should be removed
  // via the Supabase Admin API (service role) — do this from a server
  // context, not the browser, since it needs the service key.
  const { error } = await supabase.from('profiles').delete().eq('id', profileId);
  if (error) throw error;
}

export async function addDuesCategory({ name, amount, dueDate }) {
  const { data, error } = await supabase
    .from('dues_categories')
    .insert({ name, amount, due_date: dueDate })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCommunityProject(id, { raisedAmount }) {
  const { data, error } = await supabase
    .from('community_projects')
    .update({ raised_amount: raisedAmount })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}