"use client";
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { categoryColors } from '@/data/categories';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Clock, MoreHorizontal, RefreshCcw, Search, Trash, X } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useFetch from '@/hooks/use-fetch';
import { bulkDeleteTransactions } from '@/actions/account';
import { toast } from 'sonner';
import { BarLoader } from 'react-spinners';

const RECURRING_INTERVALS = {
    DAILY: "Daily",
    WEEKLY: "Weekly",
    MONTHLY: "Monthly",
    YEARLY: "Yearly",
};


const TransactionTable = ({ transactions }) => {
    const [selectIds, setSelectedIds] = useState([]);
    const [sortConfig, setSortConfig] = useState({
        field: "date",
        direction: 'desc',
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [recurringFilter, setRecurringFilter] = useState("");

    const router = useRouter();

    const {
        fn: deleteFn,
        loading: deleteLoading,
        error,
        data: deleted,
    } = useFetch(bulkDeleteTransactions)


    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete${selectIds.length} transactions?`)) {
            return;
        }
        deleteFn(selectIds)

    }

    useEffect(() => {
        if (deleted && !deleteLoading) {
            toast.success(deleted?.message || "Transactions deleted successfully");
            setSelectedIds([]);
        }
        if (error) {
            toast.error(error.message || "Failed to delete transactions");
        }
    }, [deleted, deleteLoading]);
    const filteredSortedTransactions = useMemo(() => {
        let result = [...transactions];

        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter((transaction) =>
                transaction.description?.toLowerCase().includes(searchLower)
            );
        }

        // Apply type filter
        if (typeFilter) {
            result = result.filter((transaction) => transaction.type === typeFilter);
        }

        // Apply recurring filter
        if (recurringFilter) {
            result = result.filter((transaction) => {
                if (recurringFilter === "recurring") return transaction.isRecurring;
                return !transaction.isRecurring;
            });
        }

        // Apply sorting
        result.sort((a, b) => {
            let comparison = 0;

            switch (sortConfig.field) {
                case "date":
                    comparison = new Date(a.date) - new Date(b.date);
                    break;
                case "amount":
                    comparison = a.amount - b.amount;
                    break;
                case "category":
                    comparison = a.category.localeCompare(b.category);
                    break;
                default:
                    comparison = 0;
            }

            return sortConfig.direction === "asc" ? comparison : -comparison;
        });

        return result;
    }, [
        transactions,
        searchTerm,
        typeFilter,
        recurringFilter,
        sortConfig
    ]);

    const handleSort = (field) => {
        setSortConfig(curr => ({
            field,
            direction:
                curr.field == field && curr.direction === 'asc' ? 'desc' : 'asc',
        }))

    }

    const handleSelect = (id) => {
        setSelectedIds(curr => curr.includes(id)
            ? curr.filter(i => i !== id)
            : [...curr, id]
        )
    }
    const handleSelectAll = () => {
        setSelectedIds(curr => curr.length === filteredSortedTransactions.length
            ? []
            : filteredSortedTransactions.map(transaction => transaction.id)
        )
    }



    const handleClearFilters = () => {
        setSearchTerm("")
        setTypeFilter("")
        setRecurringFilter("")
        setSelectedIds([])

    }
    return (
        <div className='space-y-4'>

            {/* Bar Loader */}
            {deleteLoading && (
                <BarLoader className='mt-4 ' width={"100%"} color='#9333ea' />
            )}
            {/* Filters */}
            <div className='flex flex-col sm:flex-row gap-4'>
                <div className='relative flex-1'>
                    <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                    <Input className='pl-8'
                        placeholder='Search transactions...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className='flex items-center gap-1 '>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger >
                            <SelectValue
                                placeholder="All Type"

                            />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="INCOME">Income</SelectItem>
                            <SelectItem value="EXPENSE">Expense</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={recurringFilter} onValueChange={(value) => setRecurringFilter(value)}>
                        <SelectTrigger className='w-[170px]'>
                            <SelectValue
                                placeholder="All Transactions"

                            />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="recurring">Recurring Only</SelectItem>
                            <SelectItem value="non-recurring">Non-Recurring Only</SelectItem>
                        </SelectContent>
                    </Select>

                    {
                        selectIds.length > 0 && (
                            <div className='flex items-center gap-2 '>

                                <Button
                                    variant='destructive'
                                    size='sm'
                                    onClick={handleBulkDelete}
                                >
                                    <Trash className='h-4 w-4 mr-2' /> Delete Selected ({selectIds.length})

                                </Button>
                            </div>
                        )
                    }

                    {(searchTerm || typeFilter || recurringFilter) && (
                        <Button variant="outline" size="icon" onClick={handleClearFilters} title="Clear Filters" >
                            <X className='h-4 w-5' />
                        </Button>
                    )}

                </div>
            </div>

            {/* Transaction table */}
            <div className='rounded-md border bg-white shadow-sm'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className='w-[50px]'>
                                <Checkbox
                                    onCheckedChange={handleSelectAll}
                                    checked={selectIds.length === filteredSortedTransactions.length && filteredSortedTransactions.length > 0}
                                />
                            </TableHead>
                            <TableHead
                                onClick={() => handleSort('date')}
                                className='cursor-pointer'
                            >
                                <div
                                    className="flex items-center gap-2"
                                >
                                    Date
                                    {sortConfig.field === 'date' && (
                                        sortConfig.direction === 'asc' ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )
                                    )}
                                </div>


                            </TableHead>
                            <TableHead
                            >
                                Description
                            </TableHead>
                            <TableHead
                                onClick={() => handleSort('category')}
                                className='cursor-pointer'
                            >
                                <div className='flex items-center '>

                                    Category
                                    {sortConfig.field === 'category' && (
                                        sortConfig.direction === 'asc' ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )
                                    )}
                                </div>
                            </TableHead>
                            <TableHead
                                onClick={() => handleSort('amount')}
                                className='cursor-pointer text-right'
                            >
                                <div className='flex items-center justify-end'>

                                    Amount
                                    {sortConfig.field === 'amount' && (
                                        sortConfig.direction === 'asc' ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )
                                    )}
                                </div>
                            </TableHead>
                            <TableHead >
                                Recurring
                            </TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            filteredSortedTransactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className='text-center text-muted-foreground'>
                                        No transactions found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSortedTransactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell className='w-[50px]'>
                                            <Checkbox onCheckedChange={() => handleSelect(transaction.id)}
                                                checked={selectIds.includes(transaction.id)}
                                            />
                                        </TableCell>

                                        {/* Date */}
                                        <TableCell className='text-sm'>
                                            {format(new Date(transaction.date), 'PP')}
                                        </TableCell>


                                        {/* Description */}
                                        <TableCell >
                                            {transaction?.description}
                                        </TableCell>

                                        {/* Category */}
                                        <TableCell className="capitalize">
                                            <span
                                                style={{
                                                    background: categoryColors[transaction?.category],
                                                }}
                                                className='px-2 py-1 rounded text-white text-sm'
                                            >

                                                {transaction?.category}
                                            </span>
                                        </TableCell>

                                        {/* Amount */}
                                        <TableCell
                                            className="text-right font-medium"
                                            style={{
                                                color: transaction?.type === 'EXPENSE' ? 'red' : 'green',
                                            }}
                                        >
                                            {transaction?.type === 'EXPENSE' ? "-" : "+"}
                                            $ {transaction?.amount.toFixed(2)}
                                        </TableCell>


                                        {/* Recurring */}
                                        <TableCell>
                                            {transaction?.isRecurring ? (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Badge variant='outline'
                                                                className='gap-1 bg-blue-100 text-purple-700 hover:bg-purple-200'
                                                            >
                                                                <RefreshCcw className='h-3 w-3' />
                                                                {RECURRING_INTERVALS[transaction?.recurringInterval]}
                                                            </Badge>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <div className='text-sm'>
                                                                <div className='font-medium'>
                                                                    Next Date :
                                                                </div>
                                                                <div>
                                                                    {format(new Date(transaction?.nextRecurringDate), 'PP')}
                                                                </div>
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            ) : (
                                                <Badge variant='outline' className='gap-1'>
                                                    <Clock className='h-3 w-3' /> One-time
                                                </Badge>
                                            )}
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuLabel
                                                    className="cursor-pointer"
                                                        onClick={() =>
                                                            router.push(`/transaction/create?edit=${transaction.id}`)
                                                        }
                                                    >Edit</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuLabel className="text-destructive cursor-pointer"
                                                        onClick={() => deleteFn([transaction.id])}
                                                    >Delete</DropdownMenuLabel>
                                                </DropdownMenuContent>

                                            </DropdownMenu>
                                        </TableCell>


                                    </TableRow>
                                ))
                            )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default TransactionTable