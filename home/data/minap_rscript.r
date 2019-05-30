 # read raw admission data from its current location
 madmission <- read_csv("C:/Users/Mai/Dropbox/Leeds/Qualdash related/Data/minap_dummy.csv")

 # get years in data
 admdate <- as.Date(madmission$`3.06 Date/time arrival at hospital`, format="%d-%m-%Y %H:%M")
 adyear <- 2000 + year(admdate)
 madmission <- cbind(madmission, adyear)

 # break it into separate files for individual years
 # and store the new files in the MINAP admissions folder under documnt root 
 for(year in unique(years)){
     tmp = subset(madmission, adyear == year)
     fn = paste('C:/Bitnami/wampstack-7.0.12-0/apache2/htdocs/Qualdashv1/home/data/minap_admission/', gsub(' ','', year), '.csv', sep='' )
     write.csv(tmp, fn, row.names = FALSE)
 }

 yfn = paste('C:/Bitnami/wampstack-7.0.12-0/apache2/htdocs/Qualdashv1/home/data/minap_admission/avail_years.csv', sep='' )
 write.csv(unique(years), yfn, row.names = FALSE)

 