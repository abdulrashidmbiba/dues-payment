import { supabase } from './supabaseClient';

/* MEMBER DASHBOARD ------------------------------------------------ */

export async function getDuesCategories() {
  const { data, error } = await supabase
    .from('dues_categories')
    .select('*')
    .eq('active', true)
    .order('due_date', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getMemberPaymentStatus(memberId) {
  const [{ data: categories, error: catErr }, { data: payments, error: payErr }] = await Promise.all([
    supabase.from('dues_categories').select('*').eq('active', true),
    supabase.from('payments').select('*').eq('member_id', memberId).eq('status', 'success'),
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

/* COMMUNITY IMPACT BOARD ------------------------------------------- */

export async function getCommunityProjects() {
  const { data, error } = await supabase
    .from('community_projects')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map((p) => ({
    ...p,
    percentFunded: p.target_amount > 0 ? Math.min(100, Math.round((p.raised_amount / p.target_amount) * 100)) : 0,
  }));
}

/* TREASURER --------------------------------------------------------- */

export async function getTreasurerStats() {
  const [{ data: payments, error: payErr }, { count: totalMembers, error: memErr }] = await Promise.all([
    supabase.from('payments').select('amount, status, paid_at').eq('status', 'success'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'member'),
  ]);
  if (payErr) throw payErr;
  if (memErr) throw memErr;

  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  const { data: paidMemberIds, error: paidErr } = await supabase
    .from('payments')
    .select('member_id')
    .eq('status', 'success');
  if (paidErr) throw paidErr;

  const uniquePaid = new Set(paidMemberIds.map((p) => p.member_id)).size;

  const monthly = {};
  payments.forEach((p) => {
    const month = new Date(p.paid_at).toLocaleString('default', { month: 'short', year: 'numeric' });
    monthly[month] = (monthly[month] || 0) + Number(p.amount);
  });

  return {
    totalCollected,
    totalMembers: totalMembers ?? 0,
    membersPaid: uniquePaid,
    membersUnpaid: Math.max(0, (totalMembers ?? 0) - uniquePaid),
    monthlyBreakdown: Object.entries(monthly).map(([month, amount]) => ({ month, amount })),
  };
}

/* ADMIN --------------------------------------------------------------- */

export async function getAllMembers() {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function removeMember(profileId) {
  const { error } = await supabase.from('profiles').delete().eq('id', profileId);
  if (error) throw error;
}

export async function updateMemberRole(profileId, role) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', profileId)
    .select()
    .single();
  if (error) throw error;
  return data;
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

export async function getAllDuesCategories() {
  const { data, error } = await supabase
    .from('dues_categories')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateDuesCategory(id, { name, amount, dueDate, active }) {
  const updates = {};
  if (name !== undefined)   updates.name = name;
  if (amount !== undefined) updates.amount = amount;
  if (dueDate !== undefined) updates.due_date = dueDate;
  if (active !== undefined) updates.active = active;

  const { data, error } = await supabase
    .from('dues_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createCommunityProject({ title, description, targetAmount }) {
  const { data, error } = await supabase
    .from('community_projects')
    .insert({ title, description, target_amount: targetAmount, raised_amount: 0 })
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

/* Every payment across every member, for the Admin Payments tab. */
export async function getAllPayments() {
  const { data, error } = await supabase
    .from('payments')
    .select('*, profiles(full_name, member_id, email), dues_categories(name)')
    .order('paid_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function approvePayment(id) {
  const { data, error } = await supabase
    .from('payments')
    .update({ status: 'success' })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function rejectPayment(id) {
  const { data, error } = await supabase
    .from('payments')
    .update({ status: 'failed' })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ANNOUNCEMENTS --------------------------------------------------------- */

export async function getAnnouncements() {
  const { data, error } = await supabase
    .from('announcements')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createAnnouncement({ title, message, createdBy }) {
  const { data, error } = await supabase
    .from('announcements')
    .insert({ title, message, created_by: createdBy })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAnnouncement(id) {
  const { error } = await supabase.from('announcements').delete().eq('id', id);
  if (error) throw error;
}