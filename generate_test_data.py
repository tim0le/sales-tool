#!/usr/bin/env python3
"""
Insurance Sales Tool - Test Data Generator
Generates comprehensive Excel test files for testing all scenarios
"""

import pandas as pd
import random
from datetime import datetime, timedelta
import os

# Ensure openpyxl is available
try:
    import openpyxl
except ImportError:
    print("Installing openpyxl...")
    os.system("pip install openpyxl")
    import openpyxl

def generate_clients(num_clients=50, include_edge_cases=False):
    """Generate client data"""
    first_names = ["Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason", "Isabella", "William",
                   "Mia", "James", "Charlotte", "Benjamin", "Amelia", "Lucas", "Harper", "Henry", "Evelyn", "Alexander",
                   "Abigail", "Michael", "Emily", "Daniel", "Elizabeth", "Matthew", "Sofia", "Jackson", "Avery", "Sebastian"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
                  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"]
    cities = ["Munich", "Berlin", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Düsseldorf", "Leipzig", "Dortmund", "Essen"]
    income_bands = ["<20k", "20k-35k", "35k-50k", "50k-75k", "75k-100k", "100k-150k", "150k+"]

    clients = []

    for i in range(1, num_clients + 1):
        age = random.randint(22, 75) if not include_edge_cases else random.choice([18, 25, 45, 54, 55, 64, 65, 80, 90])
        income_band = random.choice(income_bands)
        num_policies = random.randint(0, 8)

        # Create edge case clients
        if include_edge_cases and i <= 10:
            if i == 1:  # Very young, low income
                age, income_band, num_policies = 18, "<20k", 0
            elif i == 2:  # Very old, high income
                age, income_band, num_policies = 85, "150k+", 12
            elif i == 3:  # Boundary age (exactly 65)
                age, income_band, num_policies = 65, "50k-75k", 5
            elif i == 4:  # Boundary income (exactly 100k threshold)
                age, income_band, num_policies = 45, "100k-150k", 3
            elif i == 5:  # Zero policies
                age, income_band, num_policies = 35, "75k-100k", 0
            elif i == 6:  # Many policies
                age, income_band, num_policies = 50, "100k-150k", 15
            elif i == 7:  # Pre-retiree boundary (age 55)
                age, income_band, num_policies = 55, "50k-75k", 7
            elif i == 8:  # Growing Family age (30)
                age, income_band, num_policies = 30, "50k-75k", 2
            elif i == 9:  # Established Household age (45)
                age, income_band, num_policies = 45, "75k-100k", 6
            elif i == 10:  # High Net Worth
                age, income_band, num_policies = 40, "150k+", 8

        client = {
            "ClientID": i,
            "FullName": f"{random.choice(first_names)} {random.choice(last_names)}",
            "Age": age,
            "IncomeBandEUR": income_band,
            "City": random.choice(cities),
            "NumberOfPolicies": num_policies,
            "SalesRepID": random.randint(1, 5),
            "SalesRepName": random.choice(["Anna Schmidt", "Michael Weber", "Sarah Müller", "Thomas Fischer", "Laura Wagner"])
        }
        clients.append(client)

    return pd.DataFrame(clients)

def generate_products():
    """Generate insurance product catalog"""
    products = [
        # Health Insurance
        {"ProductCode": "HEALTH-001", "ProductName": "Basic Health Plan", "Category": "Health", "BaseAnnualPremiumMinEUR": 1200, "BaseAnnualPremiumMaxEUR": 1800},
        {"ProductCode": "HEALTH-002", "ProductName": "Premium Health Plan", "Category": "Health", "BaseAnnualPremiumMinEUR": 2400, "BaseAnnualPremiumMaxEUR": 3600},
        {"ProductCode": "HEALTH-003", "ProductName": "Family Health Plan", "Category": "Health", "BaseAnnualPremiumMinEUR": 3000, "BaseAnnualPremiumMaxEUR": 4500},

        # Life Insurance
        {"ProductCode": "LIFE-001", "ProductName": "Term Life 20-Year", "Category": "Life", "BaseAnnualPremiumMinEUR": 600, "BaseAnnualPremiumMaxEUR": 1200},
        {"ProductCode": "LIFE-002", "ProductName": "Whole Life Premium", "Category": "Life", "BaseAnnualPremiumMinEUR": 2000, "BaseAnnualPremiumMaxEUR": 4000},
        {"ProductCode": "LIFE-003", "ProductName": "Universal Life Flex", "Category": "Life", "BaseAnnualPremiumMinEUR": 1500, "BaseAnnualPremiumMaxEUR": 3000},

        # Retirement
        {"ProductCode": "RETIRE-001", "ProductName": "Basic Retirement Plan", "Category": "Retirement", "BaseAnnualPremiumMinEUR": 1800, "BaseAnnualPremiumMaxEUR": 3000},
        {"ProductCode": "RETIRE-002", "ProductName": "Premium Retirement Plan", "Category": "Retirement", "BaseAnnualPremiumMinEUR": 3600, "BaseAnnualPremiumMaxEUR": 6000},

        # Home Insurance
        {"ProductCode": "HOME-001", "ProductName": "Homeowners Standard", "Category": "Home", "BaseAnnualPremiumMinEUR": 800, "BaseAnnualPremiumMaxEUR": 1400},
        {"ProductCode": "HOME-002", "ProductName": "Homeowners Premium", "Category": "Home", "BaseAnnualPremiumMinEUR": 1400, "BaseAnnualPremiumMaxEUR": 2400},

        # Car Insurance
        {"ProductCode": "CAR-001", "ProductName": "Auto Basic Coverage", "Category": "Car", "BaseAnnualPremiumMinEUR": 600, "BaseAnnualPremiumMaxEUR": 1000},
        {"ProductCode": "CAR-002", "ProductName": "Auto Full Coverage", "Category": "Car", "BaseAnnualPremiumMinEUR": 1000, "BaseAnnualPremiumMaxEUR": 1800},

        # Income Protection
        {"ProductCode": "INCOME-001", "ProductName": "Disability Income Protection", "Category": "Income", "BaseAnnualPremiumMinEUR": 900, "BaseAnnualPremiumMaxEUR": 1800},

        # Liability
        {"ProductCode": "LIAB-001", "ProductName": "Umbrella Liability €1M", "Category": "Liability", "BaseAnnualPremiumMinEUR": 400, "BaseAnnualPremiumMaxEUR": 700},
        {"ProductCode": "LIAB-002", "ProductName": "Umbrella Liability €5M", "Category": "Liability", "BaseAnnualPremiumMinEUR": 800, "BaseAnnualPremiumMaxEUR": 1400},

        # Travel
        {"ProductCode": "TRAVEL-001", "ProductName": "Annual Travel Insurance", "Category": "Travel", "BaseAnnualPremiumMinEUR": 200, "BaseAnnualPremiumMaxEUR": 400},

        # Accident
        {"ProductCode": "ACCIDENT-001", "ProductName": "Personal Accident Coverage", "Category": "Accident", "BaseAnnualPremiumMinEUR": 300, "BaseAnnualPremiumMaxEUR": 600},

        # Legal
        {"ProductCode": "LEGAL-001", "ProductName": "Legal Expense Insurance", "Category": "Legal", "BaseAnnualPremiumMinEUR": 250, "BaseAnnualPremiumMaxEUR": 500},

        # Cyber
        {"ProductCode": "CYBER-001", "ProductName": "Cyber Protection Plan", "Category": "Cyber", "BaseAnnualPremiumMinEUR": 180, "BaseAnnualPremiumMaxEUR": 360},

        # Pet
        {"ProductCode": "PET-001", "ProductName": "Pet Health Insurance", "Category": "Pet", "BaseAnnualPremiumMinEUR": 300, "BaseAnnualPremiumMaxEUR": 600},

        # Electronics
        {"ProductCode": "ELEC-001", "ProductName": "Electronics Protection", "Category": "Electronics", "BaseAnnualPremiumMinEUR": 150, "BaseAnnualPremiumMaxEUR": 300},
    ]
    return pd.DataFrame(products)

def generate_policies(clients_df, products_df, coverage_percentage=0.4):
    """Generate existing policies for clients"""
    policies = []
    policy_id = 1

    for _, client in clients_df.iterrows():
        num_policies = client["NumberOfPolicies"]

        # Randomly assign policies
        available_products = products_df.sample(n=min(num_policies, len(products_df)))

        for _, product in available_products.iterrows():
            # Random contract start date between 1 month and 36 months ago
            months_ago = random.randint(1, 36)
            contract_date = datetime.now() - timedelta(days=months_ago * 30)

            policy = {
                "PolicyID": policy_id,
                "ClientID": client["ClientID"],
                "ProductCode": product["ProductCode"],
                "Category": product["Category"],
                "Status": "Active" if random.random() > 0.1 else "Expired",
                "ContractStartDate": contract_date.strftime("%Y-%m-%d"),
                "AnnualPremiumEUR": random.randint(product["BaseAnnualPremiumMinEUR"], product["BaseAnnualPremiumMaxEUR"])
            }
            policies.append(policy)
            policy_id += 1

    return pd.DataFrame(policies)

def generate_sales_reps():
    """Generate sales representative data"""
    reps = [
        {"SalesRepID": 1, "SalesRepName": "Anna Schmidt", "Region": "Munich", "Email": "anna.schmidt@insureco.de"},
        {"SalesRepID": 2, "SalesRepName": "Michael Weber", "Region": "Berlin", "Email": "michael.weber@insureco.de"},
        {"SalesRepID": 3, "SalesRepName": "Sarah Müller", "Region": "Hamburg", "Email": "sarah.mueller@insureco.de"},
        {"SalesRepID": 4, "SalesRepName": "Thomas Fischer", "Region": "Frankfurt", "Email": "thomas.fischer@insureco.de"},
        {"SalesRepID": 5, "SalesRepName": "Laura Wagner", "Region": "Cologne", "Email": "laura.wagner@insureco.de"},
    ]
    return pd.DataFrame(reps)

def generate_commission_rules():
    """Generate commission rules by category"""
    rules = [
        {"Category": "Health", "CommissionRatePct": 8},
        {"Category": "Life", "CommissionRatePct": 12},
        {"Category": "Retirement", "CommissionRatePct": 10},
        {"Category": "Home", "CommissionRatePct": 9},
        {"Category": "Car", "CommissionRatePct": 7},
        {"Category": "Income", "CommissionRatePct": 11},
        {"Category": "Liability", "CommissionRatePct": 10},
        {"Category": "Travel", "CommissionRatePct": 15},
        {"Category": "Accident", "CommissionRatePct": 9},
        {"Category": "Legal", "CommissionRatePct": 8},
        {"Category": "Cyber", "CommissionRatePct": 12},
        {"Category": "Pet", "CommissionRatePct": 10},
        {"Category": "Electronics", "CommissionRatePct": 13},
    ]
    return pd.DataFrame(rules)

def create_excel_file(filename, clients_df, products_df, policies_df, sales_reps_df, commission_rules_df):
    """Create Excel file with all sheets"""
    with pd.ExcelWriter(filename, engine='openpyxl') as writer:
        clients_df.to_excel(writer, sheet_name='Clients', index=False)
        products_df.to_excel(writer, sheet_name='Products', index=False)
        policies_df.to_excel(writer, sheet_name='Policies', index=False)
        sales_reps_df.to_excel(writer, sheet_name='SalesReps', index=False)
        commission_rules_df.to_excel(writer, sheet_name='CommissionRules', index=False)
    print(f"✅ Created: {filename}")

def main():
    """Generate all test data files"""
    print("🏗️  Generating test data files...\n")

    # 1. Valid standard test data (50 clients)
    print("1️⃣  Generating standard test data...")
    clients = generate_clients(50, include_edge_cases=False)
    products = generate_products()
    policies = generate_policies(clients, products)
    sales_reps = generate_sales_reps()
    commission_rules = generate_commission_rules()
    create_excel_file("test_data_valid.xlsx", clients, products, policies, sales_reps, commission_rules)

    # 2. Edge cases test data
    print("2️⃣  Generating edge cases test data...")
    clients_edge = generate_clients(30, include_edge_cases=True)
    policies_edge = generate_policies(clients_edge, products)
    create_excel_file("test_data_edge_cases.xlsx", clients_edge, products, policies_edge, sales_reps, commission_rules)

    # 3. Large dataset (1000 clients) for performance testing
    print("3️⃣  Generating large dataset (1000 clients) for performance testing...")
    clients_large = generate_clients(1000, include_edge_cases=False)
    policies_large = generate_policies(clients_large, products)
    create_excel_file("test_data_large.xlsx", clients_large, products, policies_large, sales_reps, commission_rules)

    # 4. Missing sheets (for error testing)
    print("4️⃣  Generating invalid test data (missing sheets)...")
    with pd.ExcelWriter("test_data_missing_sheets.xlsx", engine='openpyxl') as writer:
        clients.to_excel(writer, sheet_name='Clients', index=False)
        products.to_excel(writer, sheet_name='Products', index=False)
        # Missing Policies, SalesReps, CommissionRules sheets
    print("✅ Created: test_data_missing_sheets.xlsx")

    # 5. Empty sheets (for error testing)
    print("5️⃣  Generating invalid test data (empty sheets)...")
    empty_df = pd.DataFrame()
    create_excel_file("test_data_empty.xlsx", empty_df, empty_df, empty_df, empty_df, empty_df)

    print("\n✨ All test data files generated successfully!\n")
    print("📂 Generated files:")
    print("   • test_data_valid.xlsx (50 clients)")
    print("   • test_data_edge_cases.xlsx (30 clients with edge cases)")
    print("   • test_data_large.xlsx (1000 clients for performance testing)")
    print("   • test_data_missing_sheets.xlsx (invalid - missing sheets)")
    print("   • test_data_empty.xlsx (invalid - empty sheets)")
    print("\n🧪 Use these files with the Insurance Sales Tool for comprehensive testing.")

if __name__ == "__main__":
    main()
