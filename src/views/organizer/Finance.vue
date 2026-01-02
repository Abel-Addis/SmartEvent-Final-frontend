<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-h2 font-bold mb-2">
        Finance
      </h1>
      <p class="text-muted-foreground">
        Track revenue and payouts
      </p>
    </div>

    <!-- Financial Overview -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <stat-card
        label="Total Revenue"
        value="$93,750"
        icon="💰"
        trend="42"
      />
      <stat-card
        label="Platform Fee (10%)"
        value="$9,375"
        icon="📋"
        trend="0"
      />
      <stat-card
        label="Available Balance"
        value="$84,375"
        icon="💳"
        trend="42"
      />
      <stat-card
        label="Total Payouts"
        value="$50,000"
        icon="✓"
        trend="15"
      />
    </div>

    <!-- Revenue by Event -->
    <div class="card">
      <h3 class="text-h3 font-bold mb-6">
        Revenue by Event
      </h3>
      <div class="space-y-4">
        <div
          v-for="event in events"
          :key="event.id"
          class="pb-4 border-b border-border last:border-0 last:pb-0"
        >
          <div class="flex justify-between items-start mb-2">
            <div>
              <p class="font-semibold">
                {{ event.title }}
              </p>
              <p class="text-sm text-muted-foreground">
                {{ event.registrations }} registrations
              </p>
            </div>
            <div class="text-right">
              <p class="font-bold text-primary">
                {{ event.revenue }}
              </p>
              <p class="text-sm text-muted-foreground">
                {{ event.margin }} margin
              </p>
            </div>
          </div>
          <div class="h-2 bg-muted rounded-full overflow-hidden">
            <div
              class="h-full bg-primary"
              :style="{ width: `${(event.registrations / 1250) * 100}%` }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Transactions -->
    <div class="card">
      <h3 class="text-h3 font-bold mb-6">
        Recent Transactions
      </h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-muted border-b border-border">
            <tr>
              <th class="px-4 py-3 text-left font-semibold">
                Date
              </th>
              <th class="px-4 py-3 text-left font-semibold">
                Description
              </th>
              <th class="px-4 py-3 text-left font-semibold">
                Amount
              </th>
              <th class="px-4 py-3 text-left font-semibold">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="tx in transactions"
              :key="tx.id"
              class="border-b border-border hover:bg-muted/50"
            >
              <td class="px-4 py-3">
                {{ tx.date }}
              </td>
              <td class="px-4 py-3">
                {{ tx.description }}
              </td>
              <td
                class="px-4 py-3 font-bold"
                :class="tx.type === 'credit' ? 'text-foreground' : 'text-muted-foreground'"
              >
                {{ tx.type === 'credit' ? '+' : '-' }}{{ tx.amount }}
              </td>
              <td class="px-4 py-3">
                <span :class="['px-2 py-1 rounded text-xs font-medium', tx.status === 'completed' ? 'bg-muted text-foreground' : 'bg-muted text-muted-foreground']">
                  {{ tx.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Payout Settings -->
    <div class="card">
      <h3 class="text-h3 font-bold mb-4">
        Payout Settings
      </h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Payment Method</label>
          <select class="input-field w-full">
            <option>Bank Account</option>
            <option>Mobile Money</option>
          </select>
        </div>
        <button class="btn-primary py-3 px-6">
          Request Payout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import StatCard from '@/components/StatCard.vue'

const events = [
  { id: 1, title: 'Summer Music Festival', registrations: 1250, revenue: '$93,750', margin: '90%' },
  { id: 2, title: 'Tech Conference 2025', registrations: 856, revenue: '$64,200', margin: '90%' },
  { id: 3, title: 'Jazz Night', registrations: 441, revenue: '$13,230', margin: '90%' },
]

const transactions = [
  { id: 1, date: '2025-08-15', description: 'Ticket sales - Summer Music Festival', amount: '$93,750', type: 'credit', status: 'completed' },
  { id: 2, date: '2025-08-14', description: 'Platform fee (10%)', amount: '$9,375', type: 'debit', status: 'completed' },
  { id: 3, date: '2025-08-10', description: 'Payout to account', amount: '$40,000', type: 'debit', status: 'completed' },
  { id: 4, date: '2025-08-05', description: 'Early bird sales - Tech Conference', amount: '$12,800', type: 'credit', status: 'completed' },
  { id: 5, date: '2025-08-01', description: 'Payout to account', amount: '$10,000', type: 'debit', status: 'pending' },
]
</script>
