export const adminStats = [
  {
    label: "Active learners",
    value: "48,920",
    change: "+12.4% this month",
    gradient: "from-cyan-400 to-blue-500",
  },
  {
    label: "Teacher partners",
    value: "384",
    change: "28 pending review",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    label: "Monthly revenue",
    value: "$284.6k",
    change: "+$42.1k vs last month",
    gradient: "from-violet-400 to-fuchsia-500",
  },
  {
    label: "Open reports",
    value: "36",
    change: "14 high priority",
    gradient: "from-amber-300 to-orange-500",
  },
];

export const platformGrowth = [
  { month: "Jan", students: 31800, teachers: 248, courses: 820 },
  { month: "Feb", students: 35200, teachers: 271, courses: 910 },
  { month: "Mar", students: 38940, teachers: 296, courses: 1040 },
  { month: "Apr", students: 42180, teachers: 318, courses: 1168 },
  { month: "May", students: 45920, teachers: 351, courses: 1294 },
  { month: "Jun", students: 48920, teachers: 384, courses: 1412 },
];

export const revenueTrend = [
  { month: "Jan", revenue: 178400, subscriptions: 124800, marketplace: 53600 },
  { month: "Feb", revenue: 196200, subscriptions: 139300, marketplace: 56900 },
  { month: "Mar", revenue: 218900, subscriptions: 151600, marketplace: 67300 },
  { month: "Apr", revenue: 239700, subscriptions: 168200, marketplace: 71500 },
  { month: "May", revenue: 263100, subscriptions: 183400, marketplace: 79700 },
  { month: "Jun", revenue: 284600, subscriptions: 198900, marketplace: 85700 },
];

export const students = [
  { name: "Aarav Mehta", email: "aarav@classhub.test", course: "AI Product Design", spend: "$418", status: "Active", joined: "May 24" },
  { name: "Mina Cooper", email: "mina@classhub.test", course: "Full-Stack Web Apps", spend: "$249", status: "Review", joined: "May 23" },
  { name: "Leo Grant", email: "leo@classhub.test", course: "Data Analytics Mastery", spend: "$566", status: "Active", joined: "May 21" },
  { name: "Priya Nair", email: "priya@classhub.test", course: "Growth Marketing Studio", spend: "$129", status: "At risk", joined: "May 20" },
  { name: "Sam Rivera", email: "sam@classhub.test", course: "Design Systems Sprint", spend: "$328", status: "Active", joined: "May 18" },
];

export const teachers = [
  { name: "Demo Educator", specialty: "Product Design", courses: "18", rating: "4.9", status: "Verified", earnings: "$42.8k" },
  { name: "Daniel Kim", specialty: "Full-Stack", courses: "12", rating: "4.8", status: "Verified", earnings: "$38.2k" },
  { name: "Rhea Thomas", specialty: "Data Analytics", courses: "9", rating: "4.9", status: "Review", earnings: "$24.6k" },
  { name: "Omar Lee", specialty: "Marketing", courses: "7", rating: "4.7", status: "Verified", earnings: "$18.1k" },
  { name: "Elena Stone", specialty: "AI Strategy", courses: "5", rating: "4.8", status: "Paused", earnings: "$14.9k" },
];

export const courses = [
  { title: "AI Product Design", teacher: "Demo Educator", category: "Design", students: "3,280", revenue: "$82.4k", status: "Published" },
  { title: "Full-Stack Web Apps", teacher: "Daniel Kim", category: "Development", students: "4,110", revenue: "$101.2k", status: "Published" },
  { title: "Data Analytics Mastery", teacher: "Rhea Thomas", category: "Data", students: "2,460", revenue: "$57.6k", status: "Review" },
  { title: "Growth Marketing Studio", teacher: "Omar Lee", category: "Marketing", students: "1,920", revenue: "$36.8k", status: "Published" },
  { title: "AI Leadership Sprint", teacher: "Elena Stone", category: "Business", students: "820", revenue: "$18.4k", status: "Draft" },
];

export const approvals = [
  { title: "AI Leadership Sprint", teacher: "Elena Stone", submitted: "2 hours ago", risk: "Low", price: "$199", status: "Pending" },
  { title: "Advanced SQL Labs", teacher: "Rhea Thomas", submitted: "5 hours ago", risk: "Low", price: "$149", status: "Pending" },
  { title: "Performance Ads Bootcamp", teacher: "Omar Lee", submitted: "Yesterday", risk: "Medium", price: "$129", status: "Changes requested" },
  { title: "React Server Patterns", teacher: "Daniel Kim", submitted: "Yesterday", risk: "Low", price: "$249", status: "Pending" },
];

export const reports = [
  { item: "Lesson comment thread", type: "Harassment", reporter: "Priya Nair", priority: "High", status: "Open", time: "18 min ago" },
  { item: "Course landing copy", type: "Misleading claims", reporter: "Leo Grant", priority: "Medium", status: "Review", time: "42 min ago" },
  { item: "Resource upload", type: "Copyright", reporter: "Mina Cooper", priority: "High", status: "Open", time: "1 hr ago" },
  { item: "Community post", type: "Spam", reporter: "Sam Rivera", priority: "Low", status: "Resolved", time: "3 hr ago" },
];

export const notifications = [
  { title: "Approval queue rising", helper: "12 courses need admin decisions today", tone: "Review" },
  { title: "Revenue milestone", helper: "Marketplace crossed $85k this month", tone: "Active" },
  { title: "High priority reports", helper: "4 copyright reports are waiting", tone: "Open" },
  { title: "Teacher verification", helper: "8 profiles need identity review", tone: "Pending" },
];

export const activityFeed = [
  ["Course approved", "React Server Patterns was cleared for publishing", "7 min ago"],
  ["Report escalated", "Copyright report moved to legal review", "24 min ago"],
  ["Teacher verified", "A demo educator completed profile checks", "1 hr ago"],
  ["Payout reviewed", "$84.2k in creator payouts approved", "Today"],
];

export const categoryMix = [
  { name: "Development", value: 34 },
  { name: "Design", value: 24 },
  { name: "Data", value: 18 },
  { name: "Business", value: 14 },
  { name: "Marketing", value: 10 },
];
