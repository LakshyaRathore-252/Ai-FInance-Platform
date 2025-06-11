import { getUserAccounts } from '@/actions/dashboard'
import CreateAccountDrawer from '@/components/CreateAccountDrawer'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import React from 'react'
import AccountCard from './_components/Account-card'
import { getCurrentBudget } from '@/actions/budegt'
import BudgetProgress from './_components/Budegt-Progress'

export default async function DashboardPage() {

  const accounts = await getUserAccounts();
  const defaultAccount = accounts.find(account => account?.isDefault);
  let budgetData = null;

  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  return (
    <div className='px-5'>
      {/* Budget Progress */}
      {
        defaultAccount && <BudgetProgress
          initalBudget={budgetData?.budget || 0}
          currentExpenses={budgetData?.currentExpenses || 0}
        />
      }

      {/* Overview */}

      {/* Account Grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <CreateAccountDrawer >
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-full text-muted-foreground pt-5">
              <Plus className='h-10 w-10 mb-2 ' />
              <p>Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>
        {accounts.length > 0 &&
          accounts?.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}



      </div>

    </div>
  )
}